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


def test_food_web_rejects_links_to_unknown_organisms() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "FOOD_WEB_LAB",
            "content": {
                "prompt": "Connect the food web.",
                "habitat": "Pond",
                "organisms": [
                    {"id": "algae", "label": "Algae", "role": "PRODUCER"},
                    {"id": "snail", "label": "Snail", "role": "CONSUMER"},
                    {"id": "fish", "label": "Fish", "role": "CONSUMER"},
                ],
                "links": [
                    {"source": "algae", "target": "snail"},
                    {"source": "snail", "target": "heron"},
                ],
                "explanation": "Every link must use a declared organism.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_rhythm_rejects_a_pattern_with_the_wrong_length() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update(
        {
            "type": "RHYTHM_LAB",
            "content": {
                "prompt": "Rebuild the rhythm.",
                "beats": 6,
                "bpm": 80,
                "target_pattern": [True, False, True, False],
                "visual_cue": "● ○ ● ○",
                "explanation": "The pattern must contain six beats.",
            },
        }
    )
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_sentence_lab_rejects_an_order_that_omits_a_token() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "SENTENCE_LAB",
        "content": {
            "prompt": "Build the sentence.",
            "tokens": [
                {"id": "the-team", "text": "The team", "role": "SUBJECT"},
                {"id": "reads", "text": "reads", "role": "PREDICATE"},
                {"id": "a-story", "text": "a story", "role": "PREDICATE"},
                {"id": "today", "text": "today", "role": "PREDICATE"},
            ],
            "target_order": ["the-team", "reads", "a-story"],
            "explanation": "Every token belongs in the sentence.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_orbit_lab_rejects_a_gap_in_distance_ranks() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "ORBIT_LAB",
        "content": {
            "prompt": "Place the bodies in orbit.",
            "center_label": "Star",
            "bodies": [
                {"id": "a", "label": "A", "distance_rank": 1, "color": "#ffcc00"},
                {"id": "b", "label": "B", "distance_rank": 2, "color": "#00aacc"},
                {"id": "c", "label": "C", "distance_rank": 4, "color": "#cc4400"},
                {"id": "d", "label": "D", "distance_rank": 5, "color": "#88aa44"},
            ],
            "explanation": "Ranks must not skip an orbit.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_molecule_lab_rejects_duplicate_element_symbols() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "MOLECULE_LAB",
        "content": {
            "prompt": "Build water.",
            "molecule_name": "Water",
            "formula": "H2O",
            "atoms": [
                {"symbol": "H", "label": "Hydrogen", "count": 2, "color": "#eeeeee"},
                {"symbol": "H", "label": "Hydrogen again", "count": 1, "color": "#ffffff"},
            ],
            "explanation": "Each element must be declared once.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_force_lab_rejects_an_invalid_example_resultant() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "FORCE_LAB",
        "content": {
            "prompt": "Balance the cart.",
            "target_resultant": 0,
            "forces": [-5, -2, 3, 5],
            "example_solution": [-2, 5],
            "explanation": "The example does not reach zero.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_route_lab_rejects_an_example_that_hits_an_obstacle() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "ROUTE_LAB",
        "content": {
            "prompt": "Program the rover.", "rows": 4, "cols": 4,
            "start": {"row": 3, "col": 0}, "target": {"row": 0, "col": 3},
            "blocked": [{"row": 2, "col": 0}], "max_moves": 8,
            "example_moves": ["UP", "UP", "UP", "RIGHT", "RIGHT", "RIGHT"],
            "explanation": "The first move enters a blocked cell.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_climate_lab_rejects_an_example_outside_the_target_range() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "CLIMATE_LAB",
        "content": {
            "prompt": "Tune the climate.", "profile_label": "Humid profile",
            "temperature_min": 10, "temperature_max": 16,
            "rainfall_min": 900, "rainfall_max": 1400,
            "initial_temperature": 25, "initial_rainfall": 300,
            "example_temperature": 14, "example_rainfall": 500,
            "explanation": "The rainfall witness is outside the range.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_probability_lab_rejects_a_false_witness_fraction() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "PROBABILITY_LAB",
        "content": {
            "prompt": "Build one half.", "target_numerator": 1, "target_denominator": 2,
            "max_balls": 10, "initial_blue": 2, "initial_gold": 6,
            "example_blue": 3, "example_gold": 5, "draws": 20, "seed": 12,
            "explanation": "The witness does not represent one half.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_reflection_lab_rejects_an_already_solved_initial_angle() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "REFLECTION_LAB",
        "content": {
            "prompt": "Aim the ray.", "target_normal_angle": 15,
            "initial_normal_angle": 15,
            "explanation": "The initial state must require investigation.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_diffusion_lab_rejects_a_witness_with_the_wrong_gradient() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "DIFFUSION_LAB",
        "content": {
            "prompt": "Create inward flow.", "target_net_flow": "INWARD",
            "initial_outside": 2, "initial_inside": 7,
            "example_outside": 3, "example_inside": 8,
            "explanation": "This witness creates outward rather than inward flow.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_stratigraphy_lab_rejects_missing_depth_ranks() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "STRATIGRAPHY_LAB",
        "content": {
            "prompt": "Order the finds.", "site_label": "Test trench",
            "artifacts": [
                {"id": "a", "label": "Find A", "depth_rank": 1, "shape": "STONE"},
                {"id": "b", "label": "Find B", "depth_rank": 2, "shape": "POTTERY"},
                {"id": "c", "label": "Find C", "depth_rank": 4, "shape": "METAL"},
                {"id": "d", "label": "Find D", "depth_rank": 5, "shape": "GLASS"},
            ], "explanation": "Ranks three and four are not a complete sequence.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())


def test_density_lab_rejects_a_witness_with_the_wrong_state() -> None:
    package = make_package()
    with ZipFile(BytesIO(package)) as source:
        files = {name: source.read(name) for name in source.namelist()}
    activity = json.loads(files["activities/observe.json"])
    activity.update({
        "type": "DENSITY_LAB",
        "content": {
            "prompt": "Float the block.", "target_state": "FLOAT", "liquid_density": 1.0,
            "initial_mass": 12, "initial_volume": 6,
            "example_mass": 10, "example_volume": 5,
            "explanation": "The witness sinks instead of floating.",
        },
    })
    buffer = BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, json.dumps(activity) if name.endswith("observe.json") else content)
    with pytest.raises(ModulePackageError):
        validate_module_package(buffer.getvalue())
