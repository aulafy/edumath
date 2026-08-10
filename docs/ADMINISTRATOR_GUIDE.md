# School Administrator Guide

## Intended Use

EduMath is an experimental tutoring tool for supervised practice with children aged 6-8. The current release covers addition within 10. It is not an assessment, grading, diagnostic, or safeguarding system and should not replace professional teaching judgment.

## Pilot Checklist

1. Ask a qualified teacher to review the curriculum and sample sessions.
2. Install EduMath on a school-controlled computer using the installation guide.
3. Use fictional names or classroom aliases during the pilot.
4. Confirm that the computer, browser, microphone, and speaker meet school policies.
5. Keep a teacher or responsible adult present during learner use.
6. Establish a process for reporting mathematical, accessibility, or safeguarding concerns.
7. Back up the local `data` folder only to an approved encrypted location.

## Data and Privacy

The default installation stores profiles, lesson state, and progress in a local SQLite database. It does not require email addresses, dates of birth, analytics, or cloud AI. Optional local speech is processed on the same computer and raw recordings are not retained by EduMath.

The project does not claim compliance with GDPR, FERPA, COPPA, or local education law. The deploying organization remains responsible for its lawful basis, notices, retention schedule, access controls, accessibility review, and vendor/model license review.

## Network and Access

Local commands bind the application to `127.0.0.1`, so it is available only on the computer running it. Do not expose the development server directly to a school network or the public internet. A shared deployment requires authentication, HTTPS, role-based access, backups, monitoring, and a separate security review.

## AI Boundaries

EduMath works without an LLM. When a local OpenAI-compatible model is enabled, it may only phrase short messages after the deterministic tutor has selected an approved action. It cannot calculate answers, control progression, alter curriculum, or evaluate mastery.

## Model Licensing

EduMath source code is MIT licensed. Model files are separate works. The current Spanish Moonshine model is non-commercial; organizations planning paid services or other commercial use must replace it or obtain appropriate permission.
