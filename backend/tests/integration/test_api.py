from app.main import app
from fastapi.testclient import TestClient


def test_create_student_and_session() -> None:
    with TestClient(app) as client:
        student = client.post("/api/students", json={"display_name": "Ada"}).json()
        response = client.post(
            "/api/sessions", json={"student_id": student["id"], "theme": "DINOSAURS"}
        )
        assert response.status_code == 200
        payload = response.json()
        assert (
            payload["problem"]["math"]["answer"]
            == payload["problem"]["math"]["a"] + payload["problem"]["math"]["b"]
        )
        answer = client.post(
            f"/api/sessions/{payload['session_id']}/answers",
            json={
                "idempotency_key": "test-key",
                "expected_revision": payload["session_revision"],
                "answer": "999",
            },
        )
        assert answer.status_code == 200
        repeated = client.post(
            f"/api/sessions/{payload['session_id']}/answers",
            json={
                "idempotency_key": "test-key",
                "expected_revision": payload["session_revision"],
                "answer": "999",
            },
        )
        assert repeated.status_code == 200


def test_voice_capabilities_are_discoverable() -> None:
    with TestClient(app) as client:
        response = client.get("/api/voice/capabilities")
        assert response.status_code == 200
        assert response.json()["browser_tts_fallback"] is True
