SPANISH_NUMBERS = {
    "cero": 0,
    "uno": 1,
    "una": 1,
    "dos": 2,
    "tres": 3,
    "cuatro": 4,
    "cinco": 5,
    "seis": 6,
    "siete": 7,
    "ocho": 8,
    "nueve": 9,
    "diez": 10,
    "once": 11,
    "doce": 12,
    "trece": 13,
    "catorce": 14,
    "quince": 15,
    "dieciseis": 16,
    "dieciséis": 16,
    "diecisiete": 17,
    "dieciocho": 18,
    "diecinueve": 19,
    "veinte": 20,
}


def normalize_number(text: str) -> int | None:
    clean = text.strip().lower()
    for token in clean.replace(".", " ").replace(",", " ").split():
        if token.isdigit():
            return int(token)
        if token in SPANISH_NUMBERS:
            return SPANISH_NUMBERS[token]
    return None
