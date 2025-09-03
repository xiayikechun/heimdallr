import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker


def get_database_url() -> str:
    dsn = os.getenv("DATABASE_DSN", "")
    if dsn:
        return dsn

    sqlite_path = os.getenv("SQLITE_PATH", "heimdallr.db")
    return f"sqlite:///./{sqlite_path}"


database_url = get_database_url()

if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
