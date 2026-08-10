from pydantic import BaseModel, Field


class VoiceCapabilities(BaseModel):
    enabled: bool
    stt_available: bool
    tts_available: bool
    stt_provider: str
    tts_provider: str
    browser_tts_fallback: bool = True


class TranscriptionResult(BaseModel):
    text: str
    normalized_answer: int | None
    confidence: float | None = Field(default=None, ge=0, le=1)
    provider: str


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    language: str = Field(default="es", pattern="^[a-z]{2}(-[A-Z]{2})?$")
    voice: str = Field(default="lola", max_length=60)
