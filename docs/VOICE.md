# Local Voice Architecture

EduMath treats speech as an input/output layer. Speech providers cannot decide correctness,
progression, hints, difficulty, visuals, or mastery.

## Turn Flow

1. The browser records a short answer with echo cancellation and noise suppression.
2. FastAPI validates the media type and size.
3. The configured STT sidecar transcribes Spanish audio.
4. EduMath normalizes the transcript deterministically to a number.
5. The existing session answer endpoint verifies the answer.
6. The authorized tutor message is synthesized by the TTS sidecar.
7. Browser Speech Synthesis is used only when local TTS is unavailable.

Raw recordings are processed in memory and are not persisted by EduMath.

## STT Sidecar Contract

Set `VOICE_STT_URL` to an OpenAI-compatible transcription endpoint backed by Moonshine.

The bundled Spanish Moonshine model is licensed for non-commercial use under
the Moonshine Community License, even though the `moonshine-voice` package code
is MIT. Replace or separately license the model before commercial deployment.
EduMath sends multipart form data:

- `file`: WebM, OGG, WAV, MP3, or MP4 audio
- `language`: `es`
- `model`: `moonshine-es`

Expected JSON response:

```json
{"text": "son ocho", "confidence": 0.94}
```

`confidence` is optional. A transcript without a number is shown to the child and is not
submitted as a mathematical answer.

## TTS Sidecar Contract

Set `VOICE_TTS_URL` to Pocket TTS's native `/tts` endpoint. EduMath sends multipart form data:

- `text`: the authorized tutor message
- `voice_url`: `lola`

The sidecar must return audio bytes with an appropriate `Content-Type` header.

## Safety Boundaries

- Maximum recording size defaults to 8 MB.
- Only known audio MIME types are accepted.
- Synthesized text is limited to 240 characters.
- The LLM never receives raw audio and never interprets numeric correctness.
- Voice cloning is outside the MVP and child voice cloning is prohibited.
- Typed input remains available when microphone permission or a provider fails.
