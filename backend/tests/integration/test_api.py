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


def test_teacher_can_publish_a_curriculum_aligned_assignment() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "1A Mathematics", "stage": "PRIMARY", "grade": 1},
        ).json()
        teacher_headers = {"X-Teacher-Key": classroom["teacher_key"]}
        lesson_response = client.post(
            f"/api/teacher/classrooms/{classroom['id']}/lessons",
            headers=teacher_headers,
            json={
                "title": "Joining small quantities",
                "curriculum_unit_id": "ES-PRI-C1-NUM-ADD-10",
                "skill_ids": ["ADD_OBJECTS_10"],
                "problem_count": 6,
                "theme": "SPACE",
            },
        )
        assert lesson_response.status_code == 200
        lesson = lesson_response.json()
        assignment = client.post(
            f"/api/teacher/lessons/{lesson['id']}/publish",
            headers=teacher_headers,
            json={},
        ).json()
        assert len(assignment["join_code"]) == 6

        student = client.post("/api/students", json={"display_name": "Leo"}).json()
        joined = client.post(
            f"/api/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        assert joined.status_code == 200
        session = client.post(
            "/api/sessions",
            json={"student_id": student["id"], "assignment_code": assignment["join_code"]},
        ).json()
        assert session["ui"]["theme"] == "SPACE"
        assert session["problem"]["skill_id"] == "ADD_OBJECTS_10"


def test_planned_curriculum_content_cannot_be_assigned() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "3B Mathematics", "stage": "PRIMARY", "grade": 3},
        ).json()
        response = client.post(
            f"/api/teacher/classrooms/{classroom['id']}/lessons",
            headers={"X-Teacher-Key": classroom["teacher_key"]},
            json={
                "title": "Fractions",
                "curriculum_unit_id": "ES-PRI-C2-NUM-MEASURE",
                "skill_ids": ["ADD_COUNT_ON_10"],
            },
        )
        assert response.status_code == 422
