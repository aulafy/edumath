#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

[ -x .venv/bin/python ] || { echo "Run ./scripts/setup.sh first."; exit 1; }

cleanup() {
  for process_id in $(jobs -p); do
    kill "$process_id" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

echo "Starting EduMath. Open http://127.0.0.1:5173"
.venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 &
npm --prefix frontend run dev -- --host 127.0.0.1 &

if [ -x services/voice/stt/.venv/bin/uvicorn ] && [ -x services/voice/tts/.venv/bin/pocket-tts ]; then
  services/voice/stt/.venv/bin/uvicorn main:app --app-dir services/voice/stt --host 127.0.0.1 --port 8421 &
  services/voice/tts/.venv/bin/pocket-tts serve --host 127.0.0.1 --port 8422 --language spanish --quantize &
fi

wait
