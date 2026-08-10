from app.db.models import EventRow
from sqlalchemy.orm import Session


def list_events(db: Session, student_id: str) -> list[EventRow]:
    return db.query(EventRow).filter(EventRow.student_id == student_id).all()
