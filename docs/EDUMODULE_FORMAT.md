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

Each activity is JSON or YAML and must provide `id`, `type`, `title`, `instructions`, `content`, and `evidence`. Version 1.0 supports `EXPLANATION`, `CLOSED_QUESTION`, `OPEN_QUESTION`, `CLASSIFICATION`, `TIMELINE`, `MAP`, `SIMULATION`, `GUIDED_EXPERIMENT`, `READING`, `WRITING`, and `ASSESSMENT`.

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
```

This creates `examples/dist/org.edumath.examples.plant-growth-1.0.0.edumath`. In the teacher dashboard, create or open a class, choose **Import module**, and select that file. A teacher key is required for imports; browsing module metadata is read-only.

## Assign a module to a class

After import, select **Assign** beside a compatible module. EduMath shows every validated activity so the teacher can include or exclude each one before publishing. The module must explicitly map to the class stage and grade.

Publishing creates a six-character lesson code. A student enters this code on the home screen and receives only the selected activities, in teacher-defined order. Completion is recorded per student and activity. Reopening the same code resumes with completed activities marked; repeated completion requests do not create duplicate records.

Module assignments intentionally use a separate learner runner from deterministic mathematics sessions. This allows Science, Languages, History, Arts, and future subjects to grow without giving imported content access to the mathematics engine or to authoritative LLM decisions.

## Compatibility

Consumers must reject unsupported major format versions. Publishers should create a new semantic module version whenever released content changes. The same module ID and version always identify the same package bytes.

Future adapters may map reviewed H5P or Common Cartridge resources into this declarative model. LTI is better treated as an integration protocol than embedded package code and is outside EduModule 1.0.
