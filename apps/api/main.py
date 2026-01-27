from contextlib import asynccontextmanager
from typing import Optional
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from src.database import create_db_and_tables, get_session, scheduler_engine
from src.models import User, Reminder, Session as DbSession
from pydantic import BaseModel, field_validator
import phonenumbers

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

# Dependency injection for scheduler if needed later
scheduler = BackgroundScheduler(
    jobstores={'default': SQLAlchemyJobStore(engine=scheduler_engine)}
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    scheduler.start()
    print("Scheduler started")
    yield
    scheduler.shutdown()
    print("Scheduler shut down")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SigninRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_e164(cls, v: str) -> str:
        try:
            # Parse the phone number
            parsed_number = phonenumbers.parse(v)
            # Check if it's a valid number and in E.164 format
            if not (phonenumbers.is_valid_number(parsed_number) and v.startswith('+')):
                raise ValueError("Invalid phone number format")
            
            # Format to E.164 to be sure
            return phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            raise ValueError("Phone number must be a valid E.164 formatted number (e.g. +1234567890)")

@app.get("/")
def read_root():
    return {"Hello": "World", "Service": "API"}

@app.post("/signin")
def signin(request: SigninRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.phone_number == request.phone_number)).first()
    if not user:
        user = User(phone_number=request.phone_number)
        session.add(user)
        session.commit()
        session.refresh(user)

    # Create session
    token = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=7)
    db_session = DbSession(user_id=user.id, token=token, expires_at=expires_at)
    session.add(db_session)
    session.commit()

    return {"message": "Authenticated", "user": user, "session_token": token}

def get_current_user(request: Request, session: Session = Depends(get_session)):
    session_token = request.cookies.get("session_token")
    if not session_token:
        # print("DEBUG: Missing session_token cookie")
        raise HTTPException(status_code=401, detail="Not authenticated: Missing session_token")

    # Secure auth: look up session
    db_session = session.exec(select(DbSession).where(DbSession.token == session_token)).first()
    
    if not db_session:
        # print(f"DEBUG: Session not found for token: {session_token}")
        raise HTTPException(status_code=401, detail="Session invalid")

    if db_session.expires_at < datetime.now():
        # print("DEBUG: Session expired")
        raise HTTPException(status_code=401, detail="Session expired")

    user = session.get(User, db_session.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

@app.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return user

class CreateReminderRequest(BaseModel):
    title: str
    description: Optional[str] = None

@app.post("/reminders")
async def create_reminder(
    reminder_data: CreateReminderRequest, 
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reminder = Reminder(
        title=reminder_data.title,
        description=reminder_data.description,
        user_id=user.id
    )
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    return reminder

@app.get("/reminders")
async def list_reminders(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reminders = session.exec(select(Reminder).where(Reminder.user_id == user.id)).all()
    return reminders
