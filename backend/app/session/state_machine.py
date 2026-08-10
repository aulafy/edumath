from app.domain.enums import SessionState

ALLOWED_TRANSITIONS = {
    SessionState.START: {SessionState.SELECT_SKILL},
    SessionState.SELECT_SKILL: {SessionState.CREATE_PROBLEM},
    SessionState.CREATE_PROBLEM: {SessionState.VALIDATE_PROBLEM},
    SessionState.VALIDATE_PROBLEM: {
        SessionState.PRESENT_PROBLEM,
        SessionState.CREATE_PROBLEM,
        SessionState.FALLBACK,
    },
    SessionState.PRESENT_PROBLEM: {SessionState.WAITING_FOR_ANSWER},
    SessionState.WAITING_FOR_ANSWER: {SessionState.CLASSIFY_ANSWER, SessionState.PAUSED},
    SessionState.CLASSIFY_ANSWER: {SessionState.VERIFY_ANSWER},
    SessionState.VERIFY_ANSWER: {
        SessionState.UPDATE_STUDENT,
        SessionState.GIVE_HINT,
        SessionState.SHOWING_RETEACH,
    },
    SessionState.GIVE_HINT: {SessionState.WAITING_FOR_ANSWER},
    SessionState.SHOWING_RETEACH: {SessionState.WAITING_FOR_ANSWER},
    SessionState.UPDATE_STUDENT: {SessionState.ADVANCE, SessionState.WAITING_FOR_ANSWER},
    SessionState.ADVANCE: {SessionState.CREATE_PROBLEM, SessionState.SESSION_COMPLETE},
    SessionState.PAUSED: {SessionState.RECOVERING},
    SessionState.RECOVERING: {
        SessionState.WAITING_FOR_ANSWER,
        SessionState.PRESENT_PROBLEM,
        SessionState.FALLBACK,
    },
}


def can_transition(source: str, target: str) -> bool:
    return SessionState(target) in ALLOWED_TRANSITIONS.get(SessionState(source), set())
