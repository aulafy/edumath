import json
from io import BytesIO
from zipfile import ZipFile, ZipInfo

from app.main import app
from fastapi.testclient import TestClient


def make_package(custom_activity: dict | None = None) -> bytes:
    manifest = {
        "format": "EDUMODULE",
        "format_version": "1.0",
        "id": {
            "BALANCE_LAB": "org.edumath.tests.math-balance",
            "TILE_LAB": "org.edumath.tests.math-tiles",
            "TIMELINE": "org.edumath.tests.history-timeline",
            "FOOD_WEB_LAB": "org.edumath.tests.science-food-web",
            "RHYTHM_LAB": "org.edumath.tests.music-rhythm",
            "SENTENCE_LAB": "org.edumath.tests.language-sentence",
            "ORBIT_LAB": "org.edumath.tests.science-orbits",
        }.get((custom_activity or {}).get("type"), "org.edumath.tests.science-plants"),
        "version": "1.0.0",
        "title": "How plants grow",
        "summary": "A guided Primary Science investigation about plant growth.",
        "language": "es",
        "license": "CC-BY-SA-4.0",
        "authors": [{"name": "Example teaching team"}],
        "curriculum": [
            {
                "stage": "PRIMARY",
                "grades": [3, 4],
                "subject": "NATURAL_SCIENCE",
                "competencies": ["CE2"],
                "assessment_criteria": ["2.1"],
                "basic_knowledge": ["A"],
            }
        ],
        "activity_files": ["activities/observe.json"],
        "created_at": "2026-08-11T10:00:00Z",
    }
    activity = custom_activity or {
        "id": "observe-seedling",
        "type": "GUIDED_EXPERIMENT",
        "title": "Observe a seedling",
        "instructions": "Record one careful observation each day.",
    }
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        files = {
            "manifest.json": json.dumps(manifest),
            "LICENSE": "Creative Commons Attribution-ShareAlike 4.0",
            "activities/observe.json": json.dumps(activity),
        }
        for name, content in files.items():
            archive.writestr(ZipInfo(name, date_time=(2026, 8, 11, 0, 0, 0)), content)
    return buffer.getvalue()


def make_balance_activity() -> dict:
    return {
        "id": "balance-twelve",
        "type": "BALANCE_LAB",
        "title": "Balance twelve",
        "instructions": "Choose weights until both sides are equal.",
        "content": {
            "prompt": "Build 12 kilograms on the empty tray.",
            "left_value": 12,
            "weights": [2, 3, 5, 7],
            "example_solution": [5, 7],
            "explanation": "Five plus seven equals twelve.",
        },
        "evidence": {},
    }


def make_tile_activity() -> dict:
    return {
        "id": "tile-rectangle",
        "type": "TILE_LAB",
        "title": "Build a rectangle",
        "instructions": "Join tiles to match the target area and perimeter.",
        "content": {
            "prompt": "Build a shape with area 6 and perimeter 10.",
            "rows": 4,
            "cols": 4,
            "target_area": 6,
            "target_perimeter": 10,
            "example_cells": [
                {"row": 0, "col": 0}, {"row": 0, "col": 1},
                {"row": 0, "col": 2}, {"row": 1, "col": 0},
                {"row": 1, "col": 1}, {"row": 1, "col": 2},
            ],
            "explanation": "A two by three rectangle has area six and perimeter ten.",
        },
        "evidence": {},
    }


def make_timeline_activity() -> dict:
    return {
        "id": "timeline-printing",
        "type": "TIMELINE",
        "title": "The path of communication",
        "instructions": "Choose the events from oldest to newest.",
        "content": {
            "prompt": "Rebuild the communication timeline.",
            "era_label": "From writing to radio",
            "events": [
                {"id": "radio", "label": "Radio", "year": 1901, "date_label": "1901", "detail": "A radio signal crosses the Atlantic."},
                {"id": "writing", "label": "Writing", "year": -3200, "date_label": "c. 3200 BCE", "detail": "Early writing systems appear."},
                {"id": "printing", "label": "Printing press", "year": 1450, "date_label": "c. 1450", "detail": "Movable type accelerates book production."},
            ],
            "explanation": "Writing came first, then the printing press, and later radio.",
        },
        "evidence": {},
    }


def make_food_web_activity() -> dict:
    return {
        "id": "forest-food-web",
        "type": "FOOD_WEB_LAB",
        "title": "Build a forest food web",
        "instructions": "Connect food first and its consumer second.",
        "content": {
            "prompt": "Connect the forest organisms.",
            "habitat": "Temperate forest",
            "organisms": [
                {"id": "oak", "label": "Oak", "role": "PRODUCER"},
                {"id": "caterpillar", "label": "Caterpillar", "role": "CONSUMER"},
                {"id": "bird", "label": "Bird", "role": "CONSUMER"},
                {"id": "fungus", "label": "Fungus", "role": "DECOMPOSER"},
            ],
            "links": [
                {"source": "oak", "target": "caterpillar"},
                {"source": "caterpillar", "target": "bird"},
                {"source": "oak", "target": "fungus"},
            ],
            "explanation": "Energy moves from food to consumers, while fungi break down remains.",
        },
        "evidence": {},
    }


def make_rhythm_activity() -> dict:
    return {
        "id": "four-beat-rhythm",
        "type": "RHYTHM_LAB",
        "title": "Four beat rhythm",
        "instructions": "Listen and rebuild sounds and rests.",
        "content": {
            "prompt": "Rebuild the four-beat pattern.",
            "beats": 4,
            "bpm": 80,
            "target_pattern": [True, False, True, False],
            "visual_cue": "● ○ ● ○",
            "explanation": "Sounds fall on beats one and three.",
        },
        "evidence": {},
    }


def make_sentence_activity() -> dict:
    return {
        "id": "build-library-sentence",
        "type": "SENTENCE_LAB",
        "title": "Build a sentence",
        "instructions": "Place every group of words in order.",
        "content": {
            "prompt": "Build the library sentence.",
            "tokens": [
                {"id": "the-team", "text": "The team", "role": "SUBJECT"},
                {"id": "reads", "text": "reads", "role": "PREDICATE"},
                {"id": "a-story", "text": "a story", "role": "PREDICATE"},
                {"id": "today", "text": "today.", "role": "PREDICATE"},
            ],
            "target_order": ["the-team", "reads", "a-story", "today"],
            "explanation": "The subject comes before this predicate.",
        },
        "evidence": {},
    }


def make_orbit_activity() -> dict:
    return {
        "id": "rocky-planets",
        "type": "ORBIT_LAB",
        "title": "Rocky planets",
        "instructions": "Place planets from the Sun outwards.",
        "content": {
            "prompt": "Order the rocky planets.",
            "center_label": "Sun",
            "bodies": [
                {"id": "earth", "label": "Earth", "distance_rank": 3, "color": "#3f83c5"},
                {"id": "mercury", "label": "Mercury", "distance_rank": 1, "color": "#9f978d"},
                {"id": "mars", "label": "Mars", "distance_rank": 4, "color": "#c85f3d"},
                {"id": "venus", "label": "Venus", "distance_rank": 2, "color": "#d9a84d"},
            ],
            "explanation": "Mercury, Venus, Earth, and Mars are ordered from the Sun.",
        },
        "evidence": {},
    }


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


def test_teacher_can_import_list_and_export_an_edumodule() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "Open resources", "stage": "PRIMARY", "grade": 3},
        ).json()
        package = make_package()
        imported = client.post(
            "/api/modules/import",
            headers={"X-Teacher-Key": classroom["teacher_key"]},
            files={"package": ("plants.edumath", package, "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assert module["subject"] == "NATURAL_SCIENCE"
        listed = client.get("/api/modules?subject=NATURAL_SCIENCE").json()
        assert any(item["id"] == module["id"] for item in listed)
        exported = client.get(f"/api/modules/{module['id']}/export")
        assert exported.status_code == 200
        assert exported.content == package


def test_module_import_requires_a_teacher_key() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/modules/import",
            files={"package": ("plants.edumath", make_package(), "application/zip")},
        )
        assert response.status_code == 403


def test_teacher_assigns_selected_module_activities_and_student_completes_them() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "3A Science", "stage": "PRIMARY", "grade": 3},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        module = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("plants.edumath", make_package(), "application/zip")},
        ).json()
        detail = client.get(f"/api/modules/{module['id']}").json()
        activity_id = detail["activities"][0]["id"]
        published = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": [activity_id]},
        )
        assert published.status_code == 200
        assignment = published.json()
        assert assignment["kind"] == "MODULE"
        assert [activity["id"] for activity in assignment["activities"]] == [activity_id]

        student = client.post("/api/students", json={"display_name": "Mara"}).json()
        joined = client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        assert joined.status_code == 200
        assert joined.json()["completed_activity_ids"] == []
        completed = client.post(
            f"/api/modules/assignments/{assignment['join_code']}/activities/{activity_id}/complete",
            json={"student_id": student["id"]},
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == [activity_id]


def test_module_assignment_must_match_class_grade() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "1A Science", "stage": "PRIMARY", "grade": 1},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        module = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("plants.edumath", make_package(), "application/zip")},
        ).json()
        response = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["observe-seedling"]},
        )
        assert response.status_code == 422


def test_balance_lab_is_verified_by_the_server() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "3A Mathematics", "stage": "PRIMARY", "grade": 3},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        module = client.post(
            "/api/modules/import",
            headers=headers,
            files={
                "package": (
                    "balance.edumath",
                    make_package(make_balance_activity()),
                    "application/zip",
                )
            },
        ).json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["balance-twelve"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Nora"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = (
            f"/api/modules/assignments/{assignment['join_code']}"
            "/activities/balance-twelve/complete"
        )
        wrong = client.post(endpoint, json={"student_id": student["id"], "response": [5, 5, 2]})
        assert wrong.status_code == 422
        completed = client.post(
            endpoint, json={"student_id": student["id"], "response": [5, 7]}
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["balance-twelve"]


def test_tile_lab_checks_shape_area_perimeter_and_connectivity() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "3B Mathematics", "stage": "PRIMARY", "grade": 3},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("tiles.edumath", make_package(make_tile_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["tile-rectangle"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Izan"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/tile-rectangle/complete"
        disconnected = [
            {"row": 0, "col": 0}, {"row": 0, "col": 1}, {"row": 0, "col": 2},
            {"row": 3, "col": 0}, {"row": 3, "col": 1}, {"row": 3, "col": 2},
        ]
        assert client.post(endpoint, json={"student_id": student["id"], "response": disconnected}).status_code == 422
        rectangle = [
            {"row": 2, "col": 1}, {"row": 2, "col": 2}, {"row": 2, "col": 3},
            {"row": 3, "col": 1}, {"row": 3, "col": 2}, {"row": 3, "col": 3},
        ]
        completed = client.post(
            endpoint, json={"student_id": student["id"], "response": rectangle}
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["tile-rectangle"]


def test_timeline_requires_chronological_order() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "5A History", "stage": "PRIMARY", "grade": 4},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("timeline.edumath", make_package(make_timeline_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["timeline-printing"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Vega"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/timeline-printing/complete"
        wrong = ["radio", "printing", "writing"]
        assert client.post(endpoint, json={"student_id": student["id"], "response": wrong}).status_code == 422
        correct = ["writing", "printing", "radio"]
        completed = client.post(endpoint, json={"student_id": student["id"], "response": correct})
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["timeline-printing"]


def test_food_web_requires_the_exact_directed_links() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "4A Science", "stage": "PRIMARY", "grade": 4},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("food-web.edumath", make_package(make_food_web_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["forest-food-web"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Luna"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/forest-food-web/complete"
        reversed_link = [
            {"source": "caterpillar", "target": "oak"},
            {"source": "caterpillar", "target": "bird"},
            {"source": "oak", "target": "fungus"},
        ]
        assert client.post(endpoint, json={"student_id": student["id"], "response": reversed_link}).status_code == 422
        completed = client.post(
            endpoint,
            json={"student_id": student["id"], "response": make_food_web_activity()["content"]["links"]},
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["forest-food-web"]


def test_rhythm_lab_requires_the_exact_boolean_pattern() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "4B Music", "stage": "PRIMARY", "grade": 4},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("rhythm.edumath", make_package(make_rhythm_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["four-beat-rhythm"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Noa"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/four-beat-rhythm/complete"
        assert client.post(endpoint, json={"student_id": student["id"], "response": [1, 0, 1, 0]}).status_code == 422
        completed = client.post(
            endpoint, json={"student_id": student["id"], "response": [True, False, True, False]}
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["four-beat-rhythm"]


def test_sentence_lab_requires_the_exact_token_order() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "4C Language", "stage": "PRIMARY", "grade": 4},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("sentence.edumath", make_package(make_sentence_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["build-library-sentence"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Alex"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/build-library-sentence/complete"
        wrong = ["today", "the-team", "reads", "a-story"]
        assert client.post(endpoint, json={"student_id": student["id"], "response": wrong}).status_code == 422
        completed = client.post(
            endpoint,
            json={"student_id": student["id"], "response": make_sentence_activity()["content"]["target_order"]},
        )
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["build-library-sentence"]


def test_orbit_lab_requires_inside_to_outside_order() -> None:
    with TestClient(app) as client:
        classroom = client.post(
            "/api/teacher/classrooms",
            json={"name": "4D Science", "stage": "PRIMARY", "grade": 4},
        ).json()
        headers = {"X-Teacher-Key": classroom["teacher_key"]}
        imported = client.post(
            "/api/modules/import",
            headers=headers,
            files={"package": ("orbits.edumath", make_package(make_orbit_activity()), "application/zip")},
        )
        assert imported.status_code == 200
        module = imported.json()
        assignment = client.post(
            f"/api/modules/{module['id']}/assignments",
            headers=headers,
            json={"classroom_id": classroom["id"], "activity_ids": ["rocky-planets"]},
        ).json()
        student = client.post("/api/students", json={"display_name": "Sol"}).json()
        client.post(
            f"/api/modules/assignments/{assignment['join_code']}/join",
            json={"student_id": student["id"]},
        )
        endpoint = f"/api/modules/assignments/{assignment['join_code']}/activities/rocky-planets/complete"
        wrong = ["earth", "mercury", "venus", "mars"]
        assert client.post(endpoint, json={"student_id": student["id"], "response": wrong}).status_code == 422
        correct = ["mercury", "venus", "earth", "mars"]
        completed = client.post(endpoint, json={"student_id": student["id"], "response": correct})
        assert completed.status_code == 200
        assert completed.json()["completed_activity_ids"] == ["rocky-planets"]
