# EduModule 1.0

EduModule is EduMath's portable, open learning-content format. Teachers and education teams can share a single `.edumath` file, import it into a school installation, inspect its curriculum mapping, and export the original package unchanged.

The format is designed to grow beyond mathematics across Spanish Primary Education and ESO. Version 1.0 stores declarative educational content only: it never executes JavaScript, HTML, macros, plug-ins, or operating-system commands.

## Package structure

An `.edumath` file is a ZIP archive with this layout:

```text
manifest.json
LICENSE
activities/
  observe-growth.json
assets/
  optional-image.webp
```

`manifest.json` identifies the module, its semantic version, authors, content license, curriculum mapping, and every included activity and asset. Paths are relative POSIX paths. Undeclared supporting files may be included only when they use an allowed passive format.

## Minimal manifest

```json
{
  "format": "EDUMODULE",
  "format_version": "1.0",
  "id": "org.example.science.plant-growth",
  "version": "1.0.0",
  "title": "How plants grow",
  "summary": "A guided observation of seed germination and plant needs.",
  "language": "es",
  "license": "CC-BY-4.0",
  "authors": [{ "name": "Example School", "role": "AUTHOR" }],
  "curriculum": [{
    "jurisdiction": "ES",
    "autonomous_community": "STATE_BASE",
    "stage": "PRIMARY",
    "grades": [2],
    "subject": "KNOWLEDGE_OF_THE_NATURAL_SOCIAL_AND_CULTURAL_ENVIRONMENT",
    "competencies": ["STEM"],
    "assessment_criteria": [],
    "basic_knowledge": []
  }],
  "activity_files": ["activities/observe-growth.json"],
  "asset_files": [],
  "created_at": "2026-08-11T00:00:00Z"
}
```

## Activities

Each activity is JSON or YAML and must provide `id`, `type`, `title`, `instructions`, `content`, and `evidence`. Version 1.0 supports `EXPLANATION`, `CLOSED_QUESTION`, `OPEN_QUESTION`, `CLASSIFICATION`, `BALANCE_LAB`, `TILE_LAB`, `TIMELINE`, `MAP`, `SIMULATION`, `GUIDED_EXPERIMENT`, `READING`, `WRITING`, and `ASSESSMENT`.

`CLOSED_QUESTION`, `CLASSIFICATION`, `BALANCE_LAB`, and `TILE_LAB` are interactive in the learner runner. Their solutions are schema-validated on import and checked again by the backend before progress is recorded. The browser provides immediate feedback, but it is not authoritative.

`BALANCE_LAB` turns additive decomposition into direct manipulation. Its content declares a positive `left_value`, two to eight unique positive `weights`, one valid `example_solution`, and a short explanation. The learner may discover any non-repeating combination of the declared weights that reaches the target; the example is a validation witness, not the only accepted answer. Trusted EduMath code renders and grades the 3D balance.

```json
{
  "prompt": "Build 12 kg on the empty tray.",
  "left_value": 12,
  "weights": [2, 3, 4, 5, 7],
  "example_solution": [5, 7],
  "explanation": "5 + 7 = 12, so both sides are equal."
}
```

`TILE_LAB` asks learners to construct a side-connected shape on a grid. The content declares grid dimensions, target area and perimeter, and one `example_cells` witness proving that the challenge can be solved. The witness is not exposed as the required answer: any in-bounds shape with unique cells, one connected component, and the requested measurements is accepted. This supports genuine exploration, including translations, rotations, reflections, and alternative shapes.

```json
{
  "prompt": "Build one shape with area 6 and perimeter 10.",
  "rows": 4,
  "cols": 4,
  "target_area": 6,
  "target_perimeter": 10,
  "example_cells": [
    { "row": 0, "col": 0 }, { "row": 0, "col": 1 }, { "row": 0, "col": 2 },
    { "row": 1, "col": 0 }, { "row": 1, "col": 1 }, { "row": 1, "col": 2 }
  ],
  "explanation": "A two by three rectangle has area 6 and perimeter 10."
}
```

`TIMELINE` presents three to eight shuffled events as a spatial path. Each event declares a stable `id`, learner-facing label, integer `year`, display-only `date_label`, and short detail. IDs and years must be unique. Learners activate stations from the lowest to the highest year; the backend derives the answer from the years and never trusts a package-provided answer array.

```json
{
  "prompt": "Put these communication milestones in order.",
  "era_label": "From writing to radio",
  "events": [
    { "id": "radio", "label": "Public radio", "year": 1920, "date_label": "c. 1920", "detail": "Broadcasts reach many listeners." },
    { "id": "writing", "label": "Early writing", "year": -3200, "date_label": "c. 3200 BCE", "detail": "Writing records data and messages." },
    { "id": "printing", "label": "Movable-type printing", "year": 1450, "date_label": "c. 1450", "detail": "Texts can be reproduced faster." }
  ],
  "explanation": "Writing came before printing and radio."
}
```

An activity may include a trusted declarative `scene` specification. EduMath currently renders `COIN_VALUE` and `FOOD_CHAIN` with React Three Fiber and WebGL. Packages provide parameters and expected answers only; they cannot provide shaders, scripts, components, or executable scene code.

The `content` object contains subject material. The `evidence` object describes what a teacher can review. Rendering and grading remain controlled by trusted EduMath code; imported content cannot replace the learning engine or instruct the LLM to make authoritative decisions.

## Licenses and authorship

Module content must use `CC0-1.0`, `CC-BY-4.0`, or `CC-BY-SA-4.0`, and a matching license notice or full license text must be present in `LICENSE`. EduMath's MIT software license does not automatically apply to learning content.

Use an organisation, school, or consenting adult as the public author. Do not publish a child's full name, voice recording, photograph, school identifier, or other personal data in a module. Student work should enter a teacher-controlled draft and review process before publication.

## Security limits

On import, EduMath verifies archive paths, file types, declared files, schema validity, duplicate activity IDs, compressed and expanded size, file count, and symbolic links. The current limits are 20 MB compressed, 50 MB expanded, and 200 files.

Allowed assets are JSON, YAML, Markdown, plain text, PNG, JPEG, WebP, MP3, WAV, OGG, and PDF. Executable content is rejected.

## Build the example

From the repository root:

```bash
python scripts/build_example_module.py
python scripts/build_content_modules.py
```

This creates `examples/dist/org.edumath.examples.plant-growth-1.0.0.edumath`. In the teacher dashboard, create or open a class, choose **Import module**, and select that file. A teacher key is required for imports; browsing module metadata is read-only.

## Assign a module to a class

After import, select **Assign** beside a compatible module. EduMath shows every validated activity so the teacher can include or exclude each one before publishing. The module must explicitly map to the class stage and grade.

Publishing creates a six-character lesson code. A student enters this code on the home screen and receives only the selected activities, in teacher-defined order. Completion is recorded per student and activity. Reopening the same code resumes with completed activities marked; repeated completion requests do not create duplicate records.

Module assignments intentionally use a separate learner runner from deterministic mathematics sessions. This allows Science, Languages, History, Arts, and future subjects to grow without giving imported content access to the mathematics engine or to authoritative LLM decisions.

## Compatibility

Consumers must reject unsupported major format versions. Publishers should create a new semantic module version whenever released content changes. The same module ID and version always identify the same package bytes.

Future adapters may map reviewed H5P or Common Cartridge resources into this declarative model. LTI is better treated as an integration protocol than embedded package code and is outside EduModule 1.0.
