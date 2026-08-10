import json
from datetime import UTC, datetime
from uuid import uuid4

from app.db.models import EventRow
from sqlalchemy.orm import Session


def record_event(
    db: Session, student_id: str, session_id: str, event_type: str, payload: dict
) -> None:
    db.add(
        EventRow(
            id=str(uuid4()),
            student_id=student_id,
            session_id=session_id,
            event_type=event_type,
            payload_json=json.dumps(payload),
            created_at=datetime.now(UTC).isoformat(),
        )
    )
