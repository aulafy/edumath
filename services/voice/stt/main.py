import asyncio
import subprocess
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from moonshine_voice import Transcriber, get_model_for_language, load_wav_file

transcriber: Transcriber | None = None
transcriber_lock = Lock()


def load_transcriber() -> Transcriber:
    model_path, model_arch = get_model_for_language("es")
    return Transcriber(model_path=model_path, model_arch=model_arch)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global transcriber
    transcriber = await asyncio.to_thread(load_transcriber)
    yield
    transcriber = None


app = FastAPI(title="EduMath Moonshine STT", lifespan=lifespan)


def transcribe_file(source_path: Path) -> str:
    if transcriber is None:
        raise RuntimeError("Moonshine model is not loaded.")

    wav_path = source_path.parent / "converted.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source_path),
            "-ac",
            "1",
            "-ar",
            "16000",
            str(wav_path),
        ],
        check=True,
        timeout=20,
    )
    audio_data, sample_rate = load_wav_file(str(wav_path))
    with transcriber_lock:
        transcript = transcriber.transcribe_without_streaming(
            audio_data, sample_rate=sample_rate, flags=0
        )
    return " ".join(line.text.strip() for line in transcript.lines if line.text.strip()).strip()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok" if transcriber is not None else "loading", "provider": "moonshine-es"}


@app.post("/v1/audio/transcriptions")
async def transcriptions(
    file: UploadFile = File(...),
    language: str = Form("es"),
    model: str = Form("moonshine-es"),
) -> dict[str, str]:
    if language != "es":
        raise HTTPException(status_code=400, detail="This sidecar only loads the Spanish model.")

    suffix = Path(file.filename or "answer.webm").suffix or ".webm"
    try:
        with tempfile.TemporaryDirectory(prefix="edumath-stt-") as temp_dir:
            source_path = Path(temp_dir) / f"input{suffix}"
            source_path.write_bytes(await file.read())
            text = await asyncio.to_thread(transcribe_file, source_path)
    except (OSError, RuntimeError, subprocess.SubprocessError) as exc:
        raise HTTPException(status_code=500, detail="Audio transcription failed.") from exc
    return {"text": text, "language": language, "model": model}
