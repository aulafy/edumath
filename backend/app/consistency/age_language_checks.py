def check_age_language(text: str) -> list[str]:
    if len(text.split()) > 28:
        return ["Text is too long for MVP age band."]
    banned = {"facilísimo", "deberías", "rápido"}
    if any(word in text.lower() for word in banned):
        return ["Text contains pressure or shaming language."]
    return []
