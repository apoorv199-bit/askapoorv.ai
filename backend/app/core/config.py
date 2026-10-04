from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AskApoorv.ai"
    API_V1_STR: str = "/api/v1"
    GROQ_API_KEY: str
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    QDRANT_API_KEY: str | None = None
    CLUSTER_URL: str | None = None

    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    RESUME_DIR: Path = DATA_DIR / "resumes"
    CONTEXT_DIR: Path = DATA_DIR / "context"
    FRONTEND_DIR: Path = BASE_DIR.parent / "frontend"

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parent.parent.parent.parent / ".env", 
            Path(".env"),                                                  
        ),
        env_file_encoding="utf-8",
        extra="ignore" 
    )

settings = Settings()