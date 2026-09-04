from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, computed_field
from pydantic_core import MultiHostUrl

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vasooli Tracker API"
    
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Fallback to SQLite for local development
        return "sqlite+aiosqlite:///./vasooli.db"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    FINNHUB_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
