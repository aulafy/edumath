import json
from io import BytesIO
from zipfile import ZipFile

import pytest
from app.modules.package import ModulePackageError, validate_module_package


def make_package(extra_name: str | None = None) -> bytes:
    manifest = {
        "format": "EDUMODULE",
        "format_version": "1.0",
        "id": "org.edumath.example.science-plants",
        "version": "1.0.0",
        "title": "How plants grow",
        "summary": "A guided Primary Science investigation about plant growth.",
        "language": "es",
        "license": "CC-BY-SA-4.0",
        "authors": [{"name": "Example teaching team", "role": "AUTHOR"}],
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
        "asset_files": [],
        "created_at": "2026-08-11T10:00:00Z",
    }
    activity = {
        "id": "observe-seedling",
        "type": "GUIDED_EXPERIMENT",
        "title": "Observe a seedling",
        "instructions": "Record one careful observation each day.",
        "content": {"materials": ["seed", "soil", "water"]},
        "evidence": {"kind": "TEACHER_REVIEW"},
    }
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        archive.writestr("manifest.json", json.dumps(manifest))
        archive.writestr("LICENSE", "Creative Commons Attribution-ShareAlike 4.0")
        archive.writestr("activities/observe.json", json.dumps(activity))
        if extra_name:
            archive.writestr(extra_name, "not allowed")
    return buffer.getvalue()


def test_valid_edumodule_package() -> None:
    result = validate_module_package(make_package())
    assert result.manifest.id == "org.edumath.example.science-plants"
    assert result.activities[0].type == "GUIDED_EXPERIMENT"
    assert len(result.package_sha256) == 64


@pytest.mark.parametrize("name", ["../escape.json", "scripts/run.js", "/absolute.json"])
def test_package_rejects_unsafe_or_executable_files(name: str) -> None:
    with pytest.raises(ModulePackageError):
        validate_module_package(make_package(name))


def test_closed_question_requires_an_available_correct_option() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "CLOSED_QUESTION",
            "content": {
                "prompt": "Choose one answer.",
                "options": ["A", "B"],
                "correct_option": "C",
                "explanation": "Only A or B can be selected.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(
                name, json.dumps(activity) if name.endswith("observe.json") else content
            )
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_balance_lab_requires_a_valid_example_solution() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "BALANCE_LAB",
            "content": {
                "prompt": "Balance twelve kilograms.",
                "left_value": 12,
                "weights": [2, 3, 5, 7],
                "example_solution": [3, 7],
                "explanation": "Both sides must have the same value.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(
                name, json.dumps(activity) if name.endswith("observe.json") else content
            )
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_tile_lab_rejects_a_disconnected_example_shape() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "TILE_LAB",
            "content": {
                "prompt": "Build one connected shape.",
                "rows": 4,
                "cols": 4,
                "target_area": 4,
                "target_perimeter": 8,
                "example_cells": [
                    {"row": 0, "col": 0}, {"row": 0, "col": 1},
                    {"row": 3, "col": 2}, {"row": 3, "col": 3},
                ],
                "explanation": "The tiles must all touch through their sides.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(
                name, json.dumps(activity) if name.endswith("observe.json") else content
            )
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_timeline_rejects_duplicate_years() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "TIMELINE",
            "content": {
                "prompt": "Order the events.",
                "era_label": "A short era",
                "events": [
                    {"id": "one", "label": "One", "year": 1800, "date_label": "1800", "detail": "The first event."},
                    {"id": "two", "label": "Two", "year": 1800, "date_label": "1800", "detail": "The second event."},
                    {"id": "three", "label": "Three", "year": 1900, "date_label": "1900", "detail": "The third event."},
                ],
                "explanation": "Every event needs a distinct position in time.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())
