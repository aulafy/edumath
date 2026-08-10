from app.narrative.number_normalizer import normalize_number
from app.voice.providers import LocalSpeechProviders


def test_spoken_answer_is_normalized_deterministically() -> None:
    assert normalize_number("Creo que son ocho huevos") == 8


def test_voice_providers_are_optional() -> None:
    providers = LocalSpeechProviders()
    assert isinstance(providers.stt_available, bool)
    assert isinstance(providers.tts_available, bool)
