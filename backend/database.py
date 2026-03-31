from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker

import os

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # If the user provides a PG or MySQL database via environment variables
    engine = create_engine(DATABASE_URL)
else:
    # Fallback to local SQLite file for development
    sqlite_file_name = "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
