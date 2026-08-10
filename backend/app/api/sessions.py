from app.db.models import SessionRow, StudentRow
from app.db.session import get_db
from app.session.controller import (
    AnswerRequest,
    HintRequest,
    create_session,
    request_hint,
    submit_answer,
)
from app.session.recovery import response_from_session
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/sessions")


class SessionCreate(BaseModel):
    student_id: str
    theme: str = "DINOSAURS"


@router.post("")
def post_session(data: SessionCreate, db: Session = Depends(get_db)):
    if not db.get(StudentRow, data.student_id):
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
    return create_session(db, data.student_id, data.theme)


@router.get("/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "Session not found.",
                    "recoverable": False,
                }
            },
        )
    return response_from_session(row)


@router.post("/{session_id}/answers")
def post_answer(session_id: str, data: AnswerRequest, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "Session not found.",
                    "recoverable": False,
                }
            },
        )
    return submit_answer(db, row, data)


@router.post("/{session_id}/hint")
def post_hint(session_id: str, data: HintRequest, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "Session not found.",
                    "recoverable": False,
                }
            },
        )
    return request_hint(db, row, data)


@router.post("/{session_id}/pause")
def pause(session_id: str, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(status_code=404)
    row.state = "PAUSED"
    row.revision += 1
    db.commit()
    return response_from_session(row)


@router.post("/{session_id}/resume")
def resume(session_id: str, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(status_code=404)
    row.state = "WAITING_FOR_ANSWER"
    row.revision += 1
    db.commit()
    return response_from_session(row)


@router.post("/{session_id}/next")
def next_problem(session_id: str, db: Session = Depends(get_db)):
    row = db.get(SessionRow, session_id)
    if not row:
        raise HTTPException(status_code=404)
    return response_from_session(row)
