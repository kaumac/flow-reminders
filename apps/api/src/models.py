from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel
from pydantic import field_validator
import phonenumbers

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone_number: str = Field(index=True, unique=True)

    @field_validator("phone_number")
    @classmethod
    def validate_e164(cls, v: str) -> str:
        try:
            parsed_number = phonenumbers.parse(v)
            if not (phonenumbers.is_valid_number(parsed_number) and v.startswith('+')):
                raise ValueError("Invalid phone number format")
            return phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            raise ValueError("Phone number must be a valid E.164 formatted number (e.g. +1234567890)")

class Session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(index=True, unique=True)
    expires_at: datetime

class Reminder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    scheduled_time: Optional[datetime] = Field(default=None)
    title: str
    description: Optional[str] = None
    status: str = Field(default="pending")
    user_id: int = Field(foreign_key="user.id")
