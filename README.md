# EduMath

EduMath is a local-first, voice-enabled mathematics tutor for children aged 6-8. It combines deterministic learning logic with playful dinosaur and space scenes, interactive mathematical representations, and optional local AI services.

The current curriculum teaches addition within 10. EduMath is an early-stage educational project and its curriculum should be reviewed by qualified educators before classroom deployment.

## Why EduMath

- **Safe mathematical core:** arithmetic, correctness, progression, hints, and mastery are controlled by deterministic code rather than an LLM.
- **Child-friendly lessons:** responsive controls, interactive 3D themes, Ten Frames, Number Lines, and Part-Part-Whole models.
- **Voice interaction:** children can answer aloud and hear tutor feedback when the optional local speech services are enabled.
- **Private by default:** student profiles and progress remain in a local SQLite database. No cloud account or analytics service is required.
- **Resilient:** typed answers and deterministic tutor messages continue to work without speech or an LLM.
- **Cross-platform:** supported development and pilot installation paths are documented for macOS, Windows, and Linux.

## Try It Locally

### Recommended: Docker Desktop

This is the simplest route for a school pilot. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) on macOS or Windows, or Docker Engine with Compose on Linux. Then open a terminal in this folder and run:

```bash
docker compose up --build
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Student data is stored in the local `data` folder. Press `Ctrl+C` to stop EduMath.

Docker starts the core application with typed answers and device speech. Optional private speech recognition requires the local installation described in [Installation](docs/INSTALLATION.md).

### Guided Local Installation

For full local voice support or software development, follow the platform-specific steps in [docs/INSTALLATION.md](docs/INSTALLATION.md). The included setup scripts check prerequisites and install the application:

```bash
# macOS or Linux
./scripts/setup.sh
./scripts/start.sh
```

```powershell
# Windows PowerShell
.\scripts\setup.ps1
.\scripts\start.ps1
```

## What Works Today

- Local student profiles without email or birth dates.
- Addition-within-10 curriculum and deterministic problem generation.
- Dinosaur and space lesson themes rendered with Three.js.
- Three synchronized mathematical representations.
- Hints, remediation, progress evidence, session recovery, and duplicate-submission protection.
- Optional Spanish Moonshine speech-to-text and Pocket TTS speech synthesis.
- Optional OpenAI-compatible local LLM for short, non-authoritative wording only.

## Safety Architecture

The backend is authoritative. An LLM can phrase a short approved message, but it cannot select operands, calculate an answer, judge a child, change difficulty, advance the curriculum, or define a visual. Every generated lesson passes consistency checks before it reaches the learner.

See [Architecture](ARCHITECTURE.md), [Voice and privacy](docs/VOICE.md), and the [pedagogy review process](docs/pedagogy/REVIEW_PROCESS.md).

## Project Commands

```bash
make install              # Install the core application
make install-voice        # Install optional local speech engines
make backend              # Start FastAPI on port 8000
make frontend             # Start the web app on port 5173
make voice-stt            # Start Moonshine on port 8421
make voice-tts            # Start Pocket TTS on port 8422
make test                 # Run backend, scenario, and frontend tests
make validate-curriculum  # Validate curriculum files
```

## Documentation

- [Installation for schools and families](docs/INSTALLATION.md)
- [Administrator guide](docs/ADMINISTRATOR_GUIDE.md)
- [Architecture and safety boundaries](ARCHITECTURE.md)
- [Local voice architecture](docs/VOICE.md)
- [Privacy](PRIVACY.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Roadmap](ROADMAP.md)

## License

EduMath source code is released under the [MIT License](LICENSE). Third-party packages and model weights retain their own licenses. In particular, the bundled Spanish Moonshine model is licensed for **non-commercial use** under the Moonshine Community License; replace or separately license that model before commercial deployment.
