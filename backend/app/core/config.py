import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PORT: int = 8000
    HOST: str = "127.0.0.1"

    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None

    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_MAX_TOKENS: int = 4096

    CHAT_PROVIDER: str = "groq"
    CHAT_MODEL: str = "openai/gpt-oss-20b"
    CHAT_MAX_TOKENS: int = 2048

settings = Settings()
