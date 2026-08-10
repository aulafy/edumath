# Installation Guide

This guide is for teachers, school leaders, families, and IT teams. EduMath runs on one computer and opens in a normal web browser. It does not require a public server.

## Choose an Installation

| Route | Best for | Voice answers | Technical level |
| --- | --- | --- | --- |
| Docker Desktop | A quick classroom pilot | Device voice only | Low |
| Guided local setup | Full private voice and development | Yes | Medium |

## Route A: Docker Desktop

### 1. Install Docker

- macOS or Windows: install [Docker Desktop](https://www.docker.com/products/docker-desktop/), open it, and wait until Docker is running.
- Linux: install Docker Engine and the Docker Compose plugin using your distribution's official instructions.

### 2. Download EduMath

On GitHub, select **Code**, then **Download ZIP**. Extract the ZIP to an easy-to-find folder. Git users may instead run `git clone https://github.com/aulafy/edumath.git`.

### 3. Start EduMath

Open Terminal on macOS/Linux or PowerShell on Windows in the extracted folder:

```bash
docker compose up --build
```

The first start downloads the required software and can take several minutes. When both services are ready, open [http://127.0.0.1:5173](http://127.0.0.1:5173).

### 4. Stop and Restart

Press `Ctrl+C` in the terminal to stop. Later starts use the same command and preserve data in the `data` folder. To update, download the latest release or run `git pull`, then repeat the command.

If ports `8000` or `5173` are already occupied, choose alternatives before starting:

```bash
BACKEND_PORT=18000 FRONTEND_PORT=15173 docker compose up --build
```

Then open `http://127.0.0.1:15173`.

## Route B: Guided Local Setup

### Prerequisites

- Python 3.12 or newer for the core app.
- Node.js 22 or newer.
- Git, if cloning instead of downloading a ZIP.
- For local voice: Python 3.12, `uv`, and FFmpeg.

On macOS, [Homebrew](https://brew.sh/) can install these tools:

```bash
brew install python@3.12 node uv ffmpeg
```

On Windows, install Python 3.12 from python.org and Node.js from nodejs.org. For voice, run `winget install astral-sh.uv` and `winget install Gyan.FFmpeg` in PowerShell.

On Ubuntu/Debian Linux:

```bash
sudo apt update
sudo apt install python3 python3-venv nodejs npm ffmpeg
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Install

macOS or Linux:

```bash
chmod +x scripts/setup.sh scripts/start.sh
./scripts/setup.sh
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup.ps1
```

The setup asks whether to install optional voice services. Model files are downloaded on the first voice startup and require additional disk space.

### Start

macOS or Linux:

```bash
./scripts/start.sh
```

Windows PowerShell:

```powershell
.\scripts\start.ps1
```

Leave the terminal window open while EduMath is in use. Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Stop the application with `Ctrl+C`.

## Troubleshooting

- **The page does not open:** check that ports `5173` and `8000` are not used by another application.
- **The microphone is unavailable:** grant microphone permission to the browser and confirm both voice services are running.
- **Voice takes time on first start:** models are downloaded and initialized locally. Typed input remains available.
- **Windows script is blocked:** run `Set-ExecutionPolicy -Scope Process Bypass` in the same PowerShell window.
- **School-managed computer:** ask the IT team to approve Docker Desktop or the listed prerequisites. EduMath binds to the local computer only by default.

For persistent problems, open a GitHub issue without including student names, recordings, database files, or other personal information.
