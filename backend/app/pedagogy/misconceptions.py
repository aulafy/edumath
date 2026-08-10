def misconception_candidate(correct_answer: int, submitted: int | None) -> str | None:
    if submitted is not None and submitted == correct_answer + 1:
        return "ADD_COUNTS_FIRST_NUMBER_AGAIN"
    return None
