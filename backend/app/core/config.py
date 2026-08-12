from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AMICO OS API"
    app_env: str = "development"
    app_debug: bool = False
    api_prefix: str = "/api/v1"
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 30
    allowed_origins: str = "http://localhost:3000,http://localhost:8000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache

def get_settings() -> Settings:
    return Settings()
