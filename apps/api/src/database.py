import os
from sqlmodel import SQLModel, create_engine, Session

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{os.path.join(BASE_DIR, sqlite_file_name)}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

# Separate engine for APScheduler SQLAlchemyJobStore (using SQLite)
scheduler_sqlite_url = f"sqlite:///{os.path.join(BASE_DIR, 'scheduler_jobs.db')}"
scheduler_engine = create_engine(scheduler_sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def SessionLocal():
    return Session(engine)

def get_session():
    with SessionLocal() as session:
        yield session
