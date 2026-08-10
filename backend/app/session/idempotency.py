from app.db.models import AttemptRow
from sqlalchemy.orm import Session


def previous_attempt_response(db: Session, key: str) -> str | None:
    attempt = db.query(AttemptRow).filter(AttemptRow.idempotency_key == key).one_or_none()
    return attempt.response_json if attempt else None
