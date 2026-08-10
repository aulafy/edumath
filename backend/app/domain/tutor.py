from pydantic import BaseModel


class TutorMessage(BaseModel):
    message: str
    source: str
