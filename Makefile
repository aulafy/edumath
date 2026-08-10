.PHONY: install install-voice backend frontend voice-stt voice-tts dev test test-backend test-frontend test-scenarios lint format validate-curriculum seed

install:
	python3 -m venv .venv
	. .venv/bin/activate && pip install -e ".[dev]"
	cd frontend && npm install

install-voice:
	uv venv --python 3.12 services/voice/stt/.venv
	uv pip install --python services/voice/stt/.venv/bin/python -r services/voice/stt/requirements.txt
	uv venv --python 3.12 services/voice/tts/.venv
	uv pip install --python services/voice/tts/.venv/bin/python "pocket-tts==2.1.0"

backend:
	. .venv/bin/activate && uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

frontend:
	cd frontend && npm run dev -- --host 127.0.0.1

voice-stt:
	services/voice/stt/.venv/bin/uvicorn main:app --app-dir services/voice/stt --host 127.0.0.1 --port 8421

voice-tts:
	services/voice/tts/.venv/bin/pocket-tts serve --host 127.0.0.1 --port 8422 --language spanish --quantize

dev:
	@echo "Run 'make backend' and 'make frontend' in separate terminals."

test: test-backend test-scenarios test-frontend

test-backend:
	. .venv/bin/activate && pytest backend/tests

test-frontend:
	cd frontend && npm test -- --run
	cd frontend && npm run build

test-scenarios:
	. .venv/bin/activate && python scripts/run_scenarios.py

lint:
	. .venv/bin/activate && ruff check backend scripts services/voice/stt
	cd frontend && npm run lint

format:
	. .venv/bin/activate && ruff format backend scripts services/voice/stt

validate-curriculum:
	. .venv/bin/activate && python scripts/validate_curriculum.py

seed:
	. .venv/bin/activate && python scripts/generate_demo_data.py
