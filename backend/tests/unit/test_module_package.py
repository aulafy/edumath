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
