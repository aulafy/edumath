from app.db.models import StudentRow
from app.db.session import get_db
from app.student.repository import StudentCreate, create_student, list_students
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/students")


@router.post("")
def post_student(data: StudentCreate, db: Session = Depends(get_db)):
    return create_student(db, data)


@router.get("")
def get_students(db: Session = Depends(get_db)):
    return list_students(db)


@router.get("/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    row = db.get(StudentRow, student_id)
    if not row:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "STUDENT_NOT_FOUND",
                    "message": "Student not found.",
                    "recoverable": False,
                }
            },
        )
    return {"id": row.id, "display_name": row.display_name, "age_band": row.age_band}
