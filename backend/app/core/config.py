from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


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
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        """Return True when the configured database URL points to SQLite."""
        return self.DATABASE_URL.startswith("sqlite")

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
