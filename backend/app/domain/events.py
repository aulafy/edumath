from pydantic import BaseModel


class EventRecord(BaseModel):
    id: str
    student_id: str
    session_id: str
    event_type: str
    payload_json: str
    created_at: str
