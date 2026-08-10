from app.db.session import get_db
from app.student.analytics import progress_for_student
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/students")


@router.get("/{student_id}/progress")
def get_progress(student_id: str, db: Session = Depends(get_db)):
    return progress_for_student(db, student_id)
