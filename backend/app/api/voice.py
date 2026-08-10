from app.config import settings
from app.voice.providers import LocalSpeechProviders, VoiceProviderError
from app.voice.schemas import SpeechRequest, TranscriptionResult, VoiceCapabilities
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

router = APIRouter(prefix="/voice")
providers = LocalSpeechProviders()

ALLOWED_AUDIO_TYPES = {
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
}


@router.get("/capabilities", response_model=VoiceCapabilities)
def capabilities() -> VoiceCapabilities:
    return VoiceCapabilities(
        enabled=settings.voice_enabled,
        stt_available=providers.stt_available,
        tts_available=providers.tts_available,
        stt_provider="moonshine-local" if providers.stt_available else "not-configured",
        tts_provider="pocket-tts-local" if providers.tts_available else "browser-fallback",
    )


@router.post("/transcribe", response_model=TranscriptionResult)
async def transcribe(audio: UploadFile = File(...)) -> TranscriptionResult:
    content_type = (audio.content_type or "").split(";", 1)[0]
    if content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio format.")

    content = await audio.read(settings.voice_max_audio_bytes + 1)
    if len(content) > settings.voice_max_audio_bytes:
        raise HTTPException(status_code=413, detail="Audio recording is too large.")
    if not content:
        raise HTTPException(status_code=400, detail="Audio recording is empty.")

    try:
        return await providers.transcribe(content, content_type, audio.filename or "answer.webm")
    except VoiceProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/speech")
async def speech(request: SpeechRequest) -> Response:
    try:
        content, media_type = await providers.synthesize(
            request.text, request.language, request.voice
        )
    except VoiceProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return Response(content=content, media_type=media_type)
