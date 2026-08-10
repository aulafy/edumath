import httpx
from app.config import settings
from app.llm.fallback import fallback_message
from app.llm.schemas import LLMMessage, LLMRequest


async def tutor_message(request: LLMRequest) -> LLMMessage:
    if not settings.llm_enabled:
        return fallback_message(request)
    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            response = await client.post(
                f"{settings.llm_base_url}/responses",
                json={
                    "model": settings.llm_model,
                    "instructions": (
                        'Return JSON only: {"message":"..."}. Write brief, warm Spanish '
                        "feedback for a primary school child. Never mention quantities or calculations."
                    ),
                    "input": (
                        f"Pedagogical action: {request.action}. Theme: {request.theme}. "
                        f"Use at most {request.max_words} words."
                    ),
                    "temperature": 0.2,
                    "max_output_tokens": 128,
                    "reasoning": {"effort": "none"},
                },
            )
            response.raise_for_status()
            output = response.json()["output"]
            content = next(
                part["text"]
                for item in output
                if item.get("type") == "message"
                for part in item.get("content", [])
                if part.get("type") == "output_text"
            )
            parsed = LLMMessage.model_validate_json(content)
            if any(str(n) in parsed.message for n in request.protected_numbers):
                return fallback_message(request)
            return parsed
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return fallback_message(request)
