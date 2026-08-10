# Spanish Curriculum and Classroom Assignments

## Curriculum Model

EduMath maps content using the LOMLOE structure:

1. Educational stage and grade.
2. Area or subject.
3. Specific competencies.
4. Assessment criteria.
5. Basic knowledge areas.
6. EduMath skills and validated activity generators.

The national baseline is versioned in `curriculum/spain_math.v1.yaml`. It references Royal Decree 157/2022 for Primary Education and Royal Decree 217/2022 for Compulsory Secondary Education.

The state baseline is not a complete curriculum for every school. Autonomous communities establish their curricula within that framework, and schools may develop them further. Future regional files should overlay stable national unit IDs instead of copying or silently modifying the base catalog.

## Content Readiness

Every curriculum unit has a status:

- `READY`: the linked EduMath skills have deterministic generators, visual representations, validators, and tests.
- `PLANNED`: the curriculum location is mapped, but teachers cannot assign it yet.

This distinction prevents a broad curriculum menu from implying that unverified teaching content exists. The current release only enables early Primary addition within 10. Primary and ESO units beyond that are roadmap entries.

## Teacher Workflow

1. Open **Teacher panel** on the EduMath home screen.
2. Create a class with stage and grade.
3. Select a curriculum unit marked as available.
4. Choose the lesson title and child-facing theme.
5. Publish the lesson.
6. Share the six-character code verbally, on the board, or through the school's existing LMS.
7. Learners enter the code on the EduMath home screen using a local profile.

The published assignment controls the theme, allowed skills, and intended number of problems. Teacher keys are stored in the teacher's browser for the local pilot.

## Production Requirements

The current teacher key is suitable only for a local supervised pilot. A network or multi-school deployment requires staff authentication, role-based permissions, class rosters, key rotation, audit logs, data retention controls, accessibility review, HTTPS, backups, and a data protection impact assessment where required.

Children should not need email accounts. Integrations with Moodle, Google Classroom, Microsoft Teams, or regional education platforms should use the assignment API or standards such as LTI 1.3 rather than duplicating student identities.

## Official Sources

- [Spanish Ministry: LOMLOE curriculum](https://educagob.educacionfpydeportes.gob.es/curriculo/curriculo-lomloe.html)
- [Primary Education: Royal Decree 157/2022](https://www.boe.es/buscar/pdf/2022/BOE-A-2022-3296-consolidado.pdf)
- [ESO: Royal Decree 217/2022](https://www.boe.es/buscar/pdf/2022/BOE-A-2022-4975-consolidado.pdf)
