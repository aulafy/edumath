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
                f"{settings.llm_base_url}/chat/completions",
                json={
                    "model": settings.llm_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": 'Return JSON only: {"message":"..."}. Do not use numbers.',
                        },
                        {"role": "user", "content": request.model_dump_json()},
                    ],
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = LLMMessage.model_validate_json(content)
            if any(str(n) in parsed.message for n in request.protected_numbers):
                return fallback_message(request)
            return parsed
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return fallback_message(request)
