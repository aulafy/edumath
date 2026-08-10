#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

command -v python3 >/dev/null || { echo "Python 3 is required."; exit 1; }
command -v npm >/dev/null || { echo "Node.js and npm are required."; exit 1; }

echo "Installing the EduMath core application..."
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -e ".[dev]"
npm --prefix frontend install
[ -f .env ] || cp .env.example .env

read -r -p "Install optional local voice services? [y/N] " reply
if [[ "$reply" =~ ^[Yy]$ ]]; then
  command -v uv >/dev/null || { echo "Install uv first: https://docs.astral.sh/uv/"; exit 1; }
  command -v ffmpeg >/dev/null || { echo "Install FFmpeg first: https://ffmpeg.org/"; exit 1; }
  make install-voice
fi

echo "EduMath is installed. Run ./scripts/start.sh"
