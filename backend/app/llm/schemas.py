from pydantic import BaseModel, Field


class LLMRequest(BaseModel):
    action: str
    age_band: str
    theme: str
    protected_numbers: list[int] = Field(default_factory=list)
    max_words: int = 18


class LLMMessage(BaseModel):
    message: str
