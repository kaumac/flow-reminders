from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from src.database import create_db_and_tables, get_session
from src.models import User
from pydantic import BaseModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

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
    return {"message": "Authenticated", "user": user}
