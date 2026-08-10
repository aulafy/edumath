from datetime import UTC, datetime
from uuid import uuid4

from app.db.models import StudentRow
from pydantic import BaseModel
from sqlalchemy.orm import Session


class StudentCreate(BaseModel):
    display_name: str
    age_band: str = "6-8"


class Student(BaseModel):
    id: str
    display_name: str
    age_band: str


def create_student(db: Session, data: StudentCreate) -> Student:
    row = StudentRow(
        id=str(uuid4()),
        display_name=data.display_name,
        age_band=data.age_band,
        created_at=datetime.now(UTC).isoformat(),
    )
    db.add(row)
    db.commit()
    return Student(id=row.id, display_name=row.display_name, age_band=row.age_band)


def list_students(db: Session) -> list[Student]:
    return [
        Student(id=r.id, display_name=r.display_name, age_band=r.age_band)
        for r in db.query(StudentRow).all()
    ]
