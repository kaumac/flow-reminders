from contextlib import asynccontextmanager
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv()
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, or_, func
from src.database import create_db_and_tables, get_session, scheduler_engine, SessionLocal
from src.models import User, Reminder, Session as DbSession
from src.services.vapi import make_reminder_call
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

def execute_reminder_call(reminder_id: int):
    """
    Job function called by APScheduler.
    """
    print(f"[SCHEDULER] Job started for reminder_id: {reminder_id}")
    with SessionLocal() as session:
        reminder = session.exec(select(Reminder).where(Reminder.id == reminder_id)).first()
        if not reminder:
            print(f"Reminder {reminder_id} not found")
            return

        user = session.get(User, reminder.user_id)
        if not user:
            print(f"User for reminder {reminder_id} not found")
            return

        print(f"Executing call for reminder {reminder.id} to {reminder.phone_to_call}")
        
        try:
            make_reminder_call(
                phone_number=reminder.phone_to_call,
                title=reminder.title,
                description=reminder.description or ""
            )
            
            # Update status to completed
            reminder.status = "completed"
            session.add(reminder)
            session.commit()
            print(f"Reminder {reminder.id} marked as completed")
        except Exception as e:
            print(f"Error triggered for reminder {reminder.id}: {e}")
            reminder.status = "failed"
            session.add(reminder)
            session.commit()

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
    description: str
    scheduled_time: datetime
    phone_to_call: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title is required")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description is required")
        return v

    @field_validator("scheduled_time")
    @classmethod
    def validate_future_date(cls, v: datetime) -> datetime:
        if v.tzinfo:
            now = datetime.now(v.tzinfo)
        else:
            now = datetime.now()
        
        if v <= now:
            raise ValueError("Scheduled time must be in the future")
        return v

@app.post("/reminders")
async def create_reminder(
    reminder_data: CreateReminderRequest, 
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reminder = Reminder(
        title=reminder_data.title,
        description=reminder_data.description,
        scheduled_time=reminder_data.scheduled_time,
        status="pending",
        phone_to_call=reminder_data.phone_to_call,
        user_id=user.id
    )
    session.add(reminder)
    session.commit()
    session.refresh(reminder)

    # Schedule the job
    scheduler.add_job(
        execute_reminder_call,
        "date",
        run_date=reminder_data.scheduled_time,
        args=[reminder.id],
        id=f"reminder_{reminder.id}"
    )
    print(f"Scheduled job for reminder {reminder.id} at {reminder.scheduled_time}")

    return reminder

@app.get("/reminders")
async def list_reminders(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    offset = (page - 1) * limit
    
    filters = [Reminder.user_id == user.id]
    
    if search:
        filters.append(or_(Reminder.title.contains(search), Reminder.description.contains(search)))
        
    if status and status.lower() != "all":
        s = status.lower()
        if s == "scheduled":
            s = "pending" # Map UI 'Scheduled' to DB 'pending'
        filters.append(Reminder.status == s)

    # Get Total Count
    total = session.exec(select(func.count()).where(*filters)).one()
    
    # Get Items
    items = session.exec(
        select(Reminder)
        .where(*filters)
        .order_by(Reminder.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.delete("/reminders/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reminder = session.exec(select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == user.id)).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    # Remove from scheduler if exists
    job_id = f"reminder_{reminder.id}"
    try:
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)
            print(f"Removed job {job_id}")
    except Exception as e:
        print(f"Error removing job {job_id}: {e}")

    session.delete(reminder)
    session.commit()
    return {"message": "Reminder deleted successfully"}

class UpdateReminderRequest(BaseModel):
    title: str
    description: str
    scheduled_time: datetime
    phone_to_call: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title is required")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description is required")
        return v

    @field_validator("scheduled_time")
    @classmethod
    def validate_future_date(cls, v: datetime) -> datetime:
        if v.tzinfo:
            now = datetime.now(v.tzinfo)
        else:
            now = datetime.now()
        
        # For updates, we might allow keeping an old time if not changing it? 
        # But usually you update to a new time. 
        # If the user edits a past reminder, they likely want to reschedule it.
        # If they just edit the title of a past reminder, strictly speaking validation might fail if we enforce future.
        # However, the requirement says "displaying current reminder data and allowing user to update it".
        # If it's a past reminder, updating it to a past time makes no sense for a "Reminder".
        # So we enforce future time for updates too if it's being scheduled.
        
        if v <= now:
            raise ValueError("Scheduled time must be in the future")
        return v

@app.put("/reminders/{reminder_id}")
async def update_reminder(
    reminder_id: int,
    reminder_data: UpdateReminderRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reminder = session.exec(select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == user.id)).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.title = reminder_data.title
    reminder.description = reminder_data.description
    reminder.phone_to_call = reminder_data.phone_to_call
    
    old_time = reminder.scheduled_time
    reminder.scheduled_time = reminder_data.scheduled_time
    
    # If updated to future, ensure it's pending
    if reminder.scheduled_time > datetime.now(reminder.scheduled_time.tzinfo or None):
        reminder.status = "pending"

    session.add(reminder)
    session.commit()
    session.refresh(reminder)

    # Handle Scheduler
    job_id = f"reminder_{reminder.id}"
    try:
        existing_job = scheduler.get_job(job_id)
        
        # If exists, reschedule
        if existing_job:
            scheduler.reschedule_job(
                job_id, 
                trigger='date', 
                run_date=reminder.scheduled_time
            )
            print(f"Rescheduled job {job_id} to {reminder.scheduled_time}")
        else:
            # If not exists (e.g. was past/completed), add new if it is in future
            # (Validator ensures it is in future, so we add it)
            scheduler.add_job(
                execute_reminder_call,
                "date",
                run_date=reminder.scheduled_time,
                args=[reminder.id],
                id=job_id
            )
            print(f"Scheduled new job for updated reminder {reminder.id} at {reminder.scheduled_time}")

    except Exception as e:
        print(f"Error updating schedule for reminder {reminder.id}: {e}")

    return reminder
