$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw "Python 3.12 or newer is required." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "Node.js and npm are required." }

Write-Host "Installing the EduMath core application..."
python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -e ".[dev]"
npm --prefix frontend install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }

$voice = Read-Host "Install optional local voice services? [y/N]"
if ($voice -match "^[Yy]") {
    if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { throw "Install uv first: winget install astral-sh.uv" }
    if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw "Install FFmpeg first: winget install Gyan.FFmpeg" }
    uv venv --python 3.12 services/voice/stt/.venv
    uv pip install --python services/voice/stt/.venv/Scripts/python.exe -r services/voice/stt/requirements.txt
    uv venv --python 3.12 services/voice/tts/.venv
    uv pip install --python services/voice/tts/.venv/Scripts/python.exe "pocket-tts==2.1.0"
}

Write-Host "EduMath is installed. Run .\scripts\start.ps1"
