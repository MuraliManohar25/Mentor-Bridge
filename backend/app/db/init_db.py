"""
Database initialization script for Mentor Bridge.

Creates all database tables if they don't exist.
"""
from sqlalchemy.ext.asyncio import AsyncEngine
from app.db.base import Base
from app.models.user import User, Profile
from app.models.mentorship import MentorshipRequest
from app.models.job import Job
from app.models.event import Event, EventRSVP
from app.models.announcement import Announcement
from app.models.community import Circle, CircleMember, CirclePost, CircleSession
from app.models.feed import Post, PostReaction, PostComment
from app.models.student_board import StudentBoardPost, StudentBoardResponse
from app.models.messaging import Conversation, ConversationMember, Message
from app.models.notification import Notification
from app.models.referral import Referral
import logging

logger = logging.getLogger(__name__)


async def init_db(engine: AsyncEngine) -> None:
    """
    Initialize database by creating all tables and ensuring all columns exist.
    
    Args:
        engine: Async SQLAlchemy engine
    """
    from sqlalchemy import text
    try:
        async with engine.begin() as conn:
            # Create all tables defined in Base metadata
            await conn.run_sync(Base.metadata.create_all)

            # Auto-migrate missing columns for existing PostgreSQL tables (e.g. Supabase)
            alter_queries = [
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability VARCHAR(255) DEFAULT 'Available';",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(255);",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_interests JSON DEFAULT '[]'::json;",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;",
                "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSON DEFAULT '[]'::json;"
            ]
            for query in alter_queries:
                try:
                    await conn.execute(text(query))
                except Exception as ex:
                    logger.warning(f"Column migration notice: {ex}")
        
        logger.info("✅ Database tables and columns initialized successfully")
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        raise
