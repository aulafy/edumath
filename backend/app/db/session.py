from pathlib import Path

from app.config import settings
from app.db.models import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

if settings.database_url.startswith("sqlite:///./"):
    Path("data").mkdir(exist_ok=True)

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def session_scope() -> Session:
    return SessionLocal()
