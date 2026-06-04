"""
Database initialization script for GradConnect.

Creates all database tables if they don't exist.
"""
from sqlalchemy.ext.asyncio import AsyncEngine
from app.db.base import Base
from app.models.user import User, Profile
from app.models.mentorship import MentorshipRequest
import logging

logger = logging.getLogger(__name__)


async def init_db(engine: AsyncEngine) -> None:
    """
    Initialize database by creating all tables.
    
    Args:
        engine: Async SQLAlchemy engine
    """
    try:
        async with engine.begin() as conn:
            # Create all tables defined in Base metadata
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        raise
