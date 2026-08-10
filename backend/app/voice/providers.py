import httpx
from app.config import settings
from app.narrative.number_normalizer import normalize_number
from app.voice.schemas import TranscriptionResult


class VoiceProviderError(RuntimeError):
    pass


class LocalSpeechProviders:
    @property
    def stt_available(self) -> bool:
        return settings.voice_enabled and bool(settings.voice_stt_url)

    @property
    def tts_available(self) -> bool:
        return settings.voice_enabled and bool(settings.voice_tts_url)

    async def transcribe(
        self, audio: bytes, content_type: str, filename: str
    ) -> TranscriptionResult:
        if not self.stt_available:
            raise VoiceProviderError("Local speech recognition is not configured.")

        try:
            async with httpx.AsyncClient(timeout=settings.voice_timeout_seconds) as client:
                response = await client.post(
                    settings.voice_stt_url,
                    files={"file": (filename, audio, content_type)},
                    data={"language": "es", "model": "moonshine-es"},
                )
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise VoiceProviderError("The local speech recognizer did not respond.") from exc

        text = str(payload.get("text", "")).strip()
        confidence_value = payload.get("confidence")
        confidence = float(confidence_value) if isinstance(confidence_value, int | float) else None
        return TranscriptionResult(
            text=text,
            normalized_answer=normalize_number(text),
            confidence=confidence,
            provider="moonshine-local",
        )

    async def synthesize(self, text: str, language: str, voice: str) -> tuple[bytes, str]:
        if not self.tts_available:
            raise VoiceProviderError("Local speech synthesis is not configured.")

        try:
            async with httpx.AsyncClient(timeout=settings.voice_timeout_seconds) as client:
                response = await client.post(
                    settings.voice_tts_url,
                    data={"text": text, "voice_url": voice},
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise VoiceProviderError("The local speech synthesizer did not respond.") from exc
        return response.content, response.headers.get("content-type", "audio/wav")
