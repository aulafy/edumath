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

Each activity is JSON or YAML and must provide `id`, `type`, `title`, `instructions`, `content`, and `evidence`. Version 1.0 supports `EXPLANATION`, `CLOSED_QUESTION`, `OPEN_QUESTION`, `CLASSIFICATION`, `BALANCE_LAB`, `TILE_LAB`, `FOOD_WEB_LAB`, `RHYTHM_LAB`, `SENTENCE_LAB`, `ORBIT_LAB`, `MOLECULE_LAB`, `FORCE_LAB`, `ROUTE_LAB`, `CLIMATE_LAB`, `PROBABILITY_LAB`, `REFLECTION_LAB`, `DIFFUSION_LAB`, `STRATIGRAPHY_LAB`, `DENSITY_LAB`, `TIMELINE`, `MAP`, `SIMULATION`, `GUIDED_EXPERIMENT`, `READING`, `WRITING`, and `ASSESSMENT`.

`CLOSED_QUESTION`, `CLASSIFICATION`, `BALANCE_LAB`, `TILE_LAB`, `FOOD_WEB_LAB`, `RHYTHM_LAB`, `SENTENCE_LAB`, `ORBIT_LAB`, `MOLECULE_LAB`, `FORCE_LAB`, `ROUTE_LAB`, `CLIMATE_LAB`, `PROBABILITY_LAB`, `REFLECTION_LAB`, `DIFFUSION_LAB`, `STRATIGRAPHY_LAB`, `DENSITY_LAB`, and `TIMELINE` are interactive in the learner runner. Their solutions are schema-validated on import and checked again by the backend before progress is recorded. The browser provides immediate feedback, but it is not authoritative.

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

`FOOD_WEB_LAB` represents energy flow as a directed graph. It declares three to seven organisms, their producer/consumer/decomposer role, and two to twelve links. Every organism must participate; self-links, duplicate links, and unknown organism IDs are rejected. A link points from food to the organism receiving energy. The learner builds the graph edge by edge, and the backend compares sets of directed links so submission order does not matter.

```json
{
  "prompt": "Build the meadow food web.",
  "habitat": "Temperate meadow",
  "organisms": [
    { "id": "grass", "label": "Grass", "role": "PRODUCER" },
    { "id": "rabbit", "label": "Rabbit", "role": "CONSUMER" },
    { "id": "fox", "label": "Fox", "role": "CONSUMER" }
  ],
  "links": [
    { "source": "grass", "target": "rabbit" },
    { "source": "rabbit", "target": "fox" }
  ],
  "explanation": "Energy moves from grass to rabbit and then to fox."
}
```

`RHYTHM_LAB` declares 4 to 12 beats, a tempo from 50 to 120 BPM, an exact boolean sound/rest pattern, and an equivalent text cue. Patterns must contain at least one sound and one rest. Trusted EduMath code synthesises short tones with the Web Audio API and animates the 3D pads; packages cannot provide audio code. The visual cue and labelled controls provide a non-audio route through the same task.

```json
{
  "prompt": "Rebuild the four-beat echo.",
  "beats": 4,
  "bpm": 76,
  "target_pattern": [true, false, true, false],
  "visual_cue": "● ○ ● ○",
  "explanation": "The pulse continues through sounds and rests."
}
```

`SENTENCE_LAB` declares 4 to 10 unique word-group tokens, assigns each a display role (`SUBJECT`, `PREDICATE`, or `CONNECTOR`), and provides one complete target order. The order must be an exact permutation of the token IDs and the activity must contain both subject and predicate material. Learners move every token into a spatial sentence rail; the backend checks the exact ID sequence before progress is recorded. Roles are visual hints, not a substitute for syntactic review.

`ORBIT_LAB` declares 4 to 8 uniquely identified bodies with a colour and an ordinal `distance_rank`. Ranks must form a complete sequence from one, so the backend can derive the accepted inside-to-outside order. The WebGL observatory animates bodies only after learners place them; packages cannot provide executable rendering code.

`MOLECULE_LAB` declares two to four unique element symbols, atom counts and display colours. A challenge is limited to twelve atoms. Learners construct a composition with steppers while trusted code renders a rotating sphere model. The visual is explicitly compositional rather than a claim about molecular geometry, bond angles, atomic radii or scale; the backend requires the exact integer count for every declared element.

`FORCE_LAB` declares three to eight unique, non-zero signed forces, a target resultant and one valid example combination. Positive values point right and negative values point left. The witness proves solvability but is not the only accepted response: trusted backend code accepts any non-repeating subset of available forces whose integer sum equals the target.

`ROUTE_LAB` declares a 3×3 to 6×6 grid, start and target cells, unique obstacles, a move limit and one collision-free example route. Learners build a program from `UP`, `DOWN`, `LEFT`, and `RIGHT`; trusted code simulates every step and accepts any route that stays in bounds, avoids blocked cells, respects the limit and reaches the target.

`CLIMATE_LAB` declares inclusive target intervals for mean temperature and annual precipitation, an initial state outside the combined target, and one valid witness pair. Learners tune both integer values while a trusted WebGL landscape responds conceptually. The scene must be described as a simplified model rather than a forecast, biome classifier or exact representation of a real locality.

`PROBABILITY_LAB` declares a target fraction strictly between zero and one, a machine capacity, initial and witness counts for two ball colours, a draw count, and a visible integer seed. Learners must build an equivalent theoretical fraction and then run a reproducible experiment with replacement. Experimental frequency is presented for comparison and is never validated as though it must equal the theoretical probability.

`REFLECTION_LAB` declares target and initial integer orientations from −30° to 30° for the mirror normal. The learner rotates the normal while the trusted scene computes the reflected direction using the vector reflection formula. Incidence and reflection angles must be displayed from the normal, the normal must remain visible, and the scene must be described as a simplified geometric model rather than an exact optical apparatus.

`DIFFUSION_LAB` declares a target net-flow relation, initial particle counts, and one witness state for two equal-volume compartments containing the same permeable solute. Valid counts range from one to ten. The trusted runner compares concentrations to derive inward flow, outward flow, or dynamic equilibrium. Particles must remain visibly mobile in both directions, and copy must explicitly exclude water movement, osmosis, and active transport from the simplified model.

`STRATIGRAPHY_LAB` declares four to six artifacts with unique IDs, display labels, shapes, and a complete set of depth ranks where one is the shallowest layer. Learners build a relative chronology from deepest to shallowest. The activity must identify the modeled layers as undisturbed, avoid presenting relative order as an absolute date, and warn that later cuts, roots, erosion, or redeposition can alter real archaeological contexts.

`DENSITY_LAB` declares a target behavior, a fixed liquid density of 1.0 g/cm³, and initial and witness integer mass and volume values from one to twenty. The trusted runner compares mass and volume exactly: lower mass than volume floats, higher mass sinks, and equal values suspend. The interface must preserve units, show the live quotient, describe the scene as a static simplified model, and state that density alone does not identify a material.

`TECTONIC_LAB` declares one target and one initial relative plate motion (`DIVERGENT`, `CONVERGENT`, or `TRANSFORM`) plus the corresponding target feature (`RIDGE`, `MOUNTAIN_RANGE`, or `FAULT`). The schema rejects inconsistent cause-and-feature pairs and already-solved initial states. The trusted 3D runner visualises only the dominant conceptual relationship; copy must state that real plates move slowly, convergent boundaries can include subduction, and real boundaries may combine processes.

`LUNAR_PHASE_LAB` declares different initial and target positions among `NEW`, `FIRST_QUARTER`, `FULL`, and `LAST_QUARTER`. The trusted runner presents the orbital geometry and the corresponding Earth-view disk together. Content must name the viewing convention, avoid implying that the Moon emits light, distinguish ordinary phases from eclipses, and state that sizes and distances in the scene are not to scale.

`FUNCTION_MACHINE_LAB` declares exactly three unique integer inputs, three target outputs, five or six `ADD`/`MULTIPLY` cards, and one two-card witness program. Cards use non-trivial integer values from −5 to 5. The package validator executes every ordered pair of distinct cards and accepts the activity only when exactly one pair produces all three targets. The learner sees live output for every probe, while the backend independently executes the submitted card IDs in order.

`SOUND_WAVE_LAB` declares inclusive target ranges, initial values, and one witness for frequency (200–800 Hz) and a unitless visual amplitude level (1–5). The trusted runner renders both values and may play a 0.6-second sine tone only after explicit activation, with gain capped at 0.075. Audio is optional: all targets, controls, state, and feedback remain textual and visual. Content must distinguish physical frequency and amplitude from perceived pitch and loudness and must not present the visual level as decibels or a molecular simulation.

`ATOM_BUILDER_LAB` declares an element among the first eighteen, exact target and initial counts for protons (1–18), neutrons (0–22), and electrons (0–18), plus a localized element name. The package validator checks that the symbol agrees with the proton count. The runner derives `Z = p`, `A = p + n`, and `q = p − e`, while the backend requires all three target counts. The scene must be identified as a conceptual shell model whose particle sizes, distances, and electron paths are not physical scale or modern quantum orbitals.

`LIGHT_MIX_LAB` declares binary red, green, and blue light channels for both an initial and target state, plus one target label among `CYAN`, `YELLOW`, `MAGENTA`, and `WHITE`. The package validator rejects labels whose canonical additive RGB channels disagree. The runner provides labelled on/off switches, a named result, and a swatch in addition to the 3D lighting, so success never depends on colour perception alone. Content must distinguish additive light from subtractive pigment mixing.

`LEVER_LAB` declares integer masses from 1 to 6, integer distances from 1 to 4, and exactly one editable field (`LEFT_MASS`, `LEFT_DISTANCE`, `RIGHT_MASS`, or `RIGHT_DISTANCE`). The declared target must satisfy `left_mass × left_distance = right_mass × right_distance`, while `initial_value` must require a change. The runner visualises tilt but also reports both products and the named state, so the activity remains operable without colour or motion. The backend verifies equilibrium and rejects changes to locked fields.

`SHADOW_VIEW_LAB` declares four to seven uniquely positioned unit cubes, an initial cardinal orientation, and a target cardinal orientation. The runner rotates only around the vertical axis in quarter turns and derives frontal and right-side orthographic silhouettes by dropping the depth or horizontal coordinate. Package validation compares both silhouettes across all four orientations and rejects ambiguous targets. Filled grid cells use borders and hatching rather than colour alone; the backend accepts only the unique target orientation.

`CITY_BUDGET_LAB` declares three minimum indicator scores, an initial ten-token allocation, and one valid example allocation. Solar, trees, and public-transit investments each produce two points in their named indicator. Package validation enumerates every integer allocation and requires at least two valid strategies, preventing disguised single-answer questions. The runner shows the remaining budget, all numeric indicators, and a reactive 3D city; the backend independently enforces the ten-token budget and every threshold.

`BINARY_SIGNAL_LAB` declares a decimal target from 1 to 15, exactly four binary target bits in 8-4-2-1 order, and a different initial state. Package validation recomputes the weighted sum and rejects inconsistent targets. The runner synchronises labelled `ON/OFF` states, `1/0` digits, the expanded sum, decimal total, and animated 3D beacons, so neither colour nor light is required. The backend accepts only four strict integer bits matching the canonical code.

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
