def allowed_actions(state: str) -> list[str]:
    if state == "WAITING_FOR_ANSWER":
        return ["SUBMIT_ANSWER", "REQUEST_HINT", "PAUSE"]
    if state == "PAUSED":
        return ["RESUME"]
    return ["NEXT"]
