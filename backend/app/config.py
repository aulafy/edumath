from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./data/math_ai_tutor.sqlite"
    frontend_origin: str = "http://127.0.0.1:5173"
    llm_enabled: bool = False
    llm_base_url: str = "http://127.0.0.1:8080/v1"
    llm_model: str = "local-model"
    llm_timeout_seconds: int = 8
    voice_enabled: bool = True
    voice_stt_url: str = ""
    voice_tts_url: str = ""
    voice_timeout_seconds: int = 30
    voice_max_audio_bytes: int = 8_000_000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
