# Open Content Catalog

EduMath keeps its editable learning-content source in `content/open_modules.v1.json`. The build script converts each catalog entry into a deterministic, shareable `.edumath` package.

## Current coverage

| Stage | Grade | Subject | Module |
|---|---:|---|---|
| Primary | 2 | Mathematics | The coin shop |
| Primary | 3 | Knowledge of the Environment | Ecosystem detectives |
| Primary | 4 | Mathematics | The fraction workshop |
| Primary | 3 | Mathematics | The balance station |
| Primary | 4 | Mathematics | The mosaic workshop |
| Primary | 5-6 | Knowledge of the Environment | Paths that changed the world |
| Primary | 4-5 | Knowledge of the Environment | Ecosystems of connections |
| Primary | 5 | Spanish Language and Literature | The word laboratory |
| ESO | 1 | Geography and History | Journey through Prehistory |
| ESO | 2 | Physics and Chemistry | Forces in motion |

The hand-maintained catalog currently contains 30 activities. Model-generated Primary drafts live separately in `content/generated/primary/` and are counted by the coverage report. Closed questions, classification challenges, balance laboratories, mosaic workshops, time paths, and food-web laboratories are interactive and checked by the backend before completion is recorded. Selected modules also contain declarative WebGL scenes.

## Model-assisted drafting

Some catalog drafts use local Qwen 3.5 through LM Studio or Grok CLI to reduce repetitive authoring work. Model output is never imported directly. A maintainer must:

1. Check every fact, calculation, distractor, explanation, and age expectation.
2. Replace generic competency wording with the relevant Spanish curriculum references.
3. Move data into the exact EduModule schema and remove unsupported fields.
4. Build the package and pass the package validator and automated tests.
5. Request qualified educator review before classroom deployment.

In the current catalog, Grok assisted with the initial forces-and-motion draft. Local Qwen assisted with the initial fractions draft. Both required corrections before validation.

## Build and validate

```bash
python scripts/build_content_modules.py
pytest backend/tests
```

Generated packages are written to `examples/dist/`, which is intentionally ignored by Git. Import them from the teacher dashboard after reviewing their source.
