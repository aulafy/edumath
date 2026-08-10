$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

if (-not (Test-Path .\.venv\Scripts\python.exe)) { throw "Run .\scripts\setup.ps1 first." }

Write-Host "Starting EduMath. Open http://127.0.0.1:5173"
$processes = @()
$processes += Start-Process -PassThru -NoNewWindow .\.venv\Scripts\uvicorn.exe -ArgumentList "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8000"
$processes += Start-Process -PassThru -NoNewWindow npm -ArgumentList "--prefix", "frontend", "run", "dev", "--", "--host", "127.0.0.1"

if ((Test-Path services/voice/stt/.venv/Scripts/uvicorn.exe) -and (Test-Path services/voice/tts/.venv/Scripts/pocket-tts.exe)) {
    $processes += Start-Process -PassThru -NoNewWindow services/voice/stt/.venv/Scripts/uvicorn.exe -ArgumentList "main:app", "--app-dir", "services/voice/stt", "--host", "127.0.0.1", "--port", "8421"
    $processes += Start-Process -PassThru -NoNewWindow services/voice/tts/.venv/Scripts/pocket-tts.exe -ArgumentList "serve", "--host", "127.0.0.1", "--port", "8422", "--language", "spanish", "--quantize"
}

try { $processes | Wait-Process } finally { $processes | Stop-Process -ErrorAction SilentlyContinue }
