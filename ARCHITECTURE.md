# Architecture

The app separates three planes:

- Control Plane: session state, planner, revision checks, idempotency, evidence, hints, and progress.
- Content Plane: problem specs, computed answers, visuals, story templates, validators, and consistency gate.
- Generative Plane: optional local LLM messages with deterministic fallback.

The backend is authoritative. React renders, collects input, and sends commands. It does not compute correctness, mastery, difficulty, or state transitions.

## Invariants

- `MathSpec.answer` is computed from operation and operands.
- Visuals are discriminated unions.
- Curriculum files are versioned.
- Invalid content is blocked by `ConsistencyGate`.
- `expected_revision` prevents silent concurrent edits.
- `idempotency_key` prevents duplicate attempts.
- The app works with `LLM_ENABLED=false`.
