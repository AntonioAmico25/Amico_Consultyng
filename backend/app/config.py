from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AMICO_", env_file=".env", extra="ignore")

    environment: str = "development"
    openai_api_key: SecretStr | None = None
    cognitive_default_provider: str = "deterministic"
    cognitive_default_model: str = "gpt-5.6-luna"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_timeout_seconds: float = 45.0
    openai_input_usd_per_mtok: float = 0.20
    openai_output_usd_per_mtok: float = 1.20
    f41_grounding_threshold: int = 80
    f41_security_threshold: int = 90
    f41_latency_p95_ms: int = 15000
    f41_max_cost_usd_per_case: float = 0.02


@lru_cache
def get_settings() -> Settings:
    return Settings()
