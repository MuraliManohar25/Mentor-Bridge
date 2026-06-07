import ssl

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict, List, Any


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    APP_NAME: str = "Mentor Bridge"
    DEBUG: bool = True
    AUTO_CREATE_TABLES: bool = True
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-12345678901234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./mentor_bridge.db"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        origins: List[str] = []
        for origin in self.CORS_ORIGINS.split(","):
            origin = origin.strip()
            if not origin:
                continue
            if not origin.startswith(("http://", "https://")):
                origin = f"https://{origin}"
            origins.append(origin)
        return origins

    @property
    def resolved_database_url(self) -> str:
        """Normalize database URLs for async SQLAlchemy (e.g. Render/Heroku postgres://)."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://") and "+asyncpg" not in url:
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def is_sqlite(self) -> bool:
        """Return True when the configured database URL points to SQLite."""
        return self.resolved_database_url.startswith("sqlite")

    @property
    def database_connect_args(self) -> Dict[str, Any]:
        """Driver connect args (SQLite thread check, TLS for remote Postgres e.g. Supabase)."""
        if self.is_sqlite:
            return {"check_same_thread": False}
        url = self.resolved_database_url.lower()
        if "localhost" in url or "127.0.0.1" in url:
            return {}
        return {"ssl": ssl.create_default_context()}

    def validate_production_settings(self) -> None:
        """Fail fast when unsafe development settings are used in production."""
        if self.DEBUG:
            return

        if self.SECRET_KEY.startswith("dev-secret-key") or self.SECRET_KEY == "your-secret-key-here-change-in-production":
            raise ValueError("SECRET_KEY must be changed before running with DEBUG=False")

        if not self.cors_origins_list:
            raise ValueError("CORS_ORIGINS must include at least one production frontend origin")

        if "*" in self.cors_origins_list:
            raise ValueError("CORS_ORIGINS cannot include '*' when DEBUG=False")


# Global settings instance
settings = Settings()
