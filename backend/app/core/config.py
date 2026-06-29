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
    
    # Credenciales de proveedores
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None

    # Enrutamiento de modelos por agente
    TRIAGE_PROVIDER: str = "gemini"
    TRIAGE_MODEL: str = "gemini-2.5-flash"

    PLANNER_PROVIDER: str = "groq"
    PLANNER_MODEL: str = "llama-3.3-70b-specdec"

    EXECUTOR_PROVIDER: str = "gemini"
    EXECUTOR_MODEL: str = "gemini-2.5-flash"

settings = Settings()