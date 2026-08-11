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
| Primary | 2-4 | Art Education | The rhythm factory |
| Primary | 4 | Spanish Language and Literature | Sentences in orbit |
| Primary | 5-6 | Knowledge of the Environment | The distance observatory |
| ESO | 2 | Physics and Chemistry | The molecule workbench |
| ESO | 2 | Physics and Chemistry | The force bench |
| Primary | 5-6 | Mathematics | Route explorers |
| ESO | 1 | Geography and History | The landscape station |
| Primary | 6 | Mathematics | The probability machine |
| ESO | 3 | Physics and Chemistry | The ray bench |
| ESO | 3 | Biology and Geology | The molecular frontier |
| ESO | 1 | Geography and History | The trench of time |
| ESO | 2 | Physics and Chemistry | The density tank |
| ESO | 1 | Biology and Geology | The tectonic table |
| ESO | 1 | Biology and Geology | The lunar phase observatory |
| ESO | 1 | Mathematics | The function factory |
| ESO | 2 | Physics and Chemistry | The sound-wave studio |
| ESO | 2 | Physics and Chemistry | The atom builder |
| Primary | 5 | Art Education | The additive-light theatre |
| Primary | 6 | Knowledge of the Environment | The impossible lever |
| Primary | 6 | Mathematics | The museum of impossible views |
| Primary | 6 | Civic and Ethical Values | The eco-city council |
| Primary | 6 | Knowledge of the Environment | The four-bit signal tower |
| Primary | 5 | Spanish Language and Literature | The pause conductor |
| Primary | 6 | Knowledge of the Environment | The red cell journey |
| Primary | 5 | Spanish Language and Literature | The word laboratory |
| ESO | 1 | Geography and History | Journey through Prehistory |
| ESO | 2 | Physics and Chemistry | Forces in motion |

The hand-maintained catalog currently contains 103 activities. Model-generated Primary drafts live separately in `content/generated/primary/` and are counted by the coverage report. Closed questions, classification challenges, balance laboratories, mosaic workshops, time paths, food-web laboratories, rhythm sequencers, sentence laboratories, orbital observatories, molecule workbenches, force benches, route laboratories, climate stations, probability machines, reflection benches, diffusion membranes, stratigraphic trenches, density tanks, tectonic tables, lunar observatories, function factories, sound-wave studios, atom builders, additive-light theatres, lever laboratories, shadow-view studios, city-budget simulations, binary-signal towers, punctuation stages, and circulation journeys are interactive and checked by the backend before completion is recorded. Selected modules also contain declarative WebGL scenes.

## Model-assisted drafting

Some catalog drafts use local Qwen 3.5 through LM Studio or Grok CLI to reduce repetitive authoring work. Model output is never imported directly. A maintainer must:

1. Check every fact, calculation, distractor, explanation, and age expectation.
2. Replace generic competency wording with the relevant Spanish curriculum references.
3. Move data into the exact EduModule schema and remove unsupported fields.
4. Build the package and pass the package validator and automated tests.
5. Request qualified educator review before classroom deployment.

In the current catalog, Grok assisted with the initial forces-and-motion draft and reviewed safeguards for the probability, reflection, diffusion, stratigraphy, density, tectonic, lunar-phase, function-machine, sound-wave, atom-builder, additive-light, lever, shadow-view, city-budget, binary-signal, punctuation, and circulation laboratories. Local Qwen assisted with the initial fractions draft and concepts for probability, reflection, diffusion, stratigraphy, density, tectonic, lunar-phase, function-machine, sound-wave, atom-builder, additive-light, shadow-view, city-budget, binary-signal, punctuation, and circulation missions. All model-assisted material required human correction before validation.

## Build and validate

```bash
python scripts/build_content_modules.py
pytest backend/tests
```

Generated packages are written to `examples/dist/`, which is intentionally ignored by Git. Import them from the teacher dashboard after reviewing their source.
