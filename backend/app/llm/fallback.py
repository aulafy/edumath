from app.llm.schemas import LLMMessage, LLMRequest


def fallback_message(request: LLMRequest) -> LLMMessage:
    messages = {
        "PRAISE_REASONING": "Buena idea. Has pensado con calma.",
        "TRY_AGAIN": "Probemos otra vez, paso a paso.",
    }
    return LLMMessage(message=messages.get(request.action, "Seguimos explorando juntos."))
