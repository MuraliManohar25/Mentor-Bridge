import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal, engine
from app.db.init_db import init_db
from app.db.base import Base

# Import all models to ensure metadata is complete
from app.models.user import User, Profile
from app.models.mentorship import MentorshipRequest
from app.models.community import Circle, CircleMember, CirclePost, CircleSession
from app.models.feed import Post, PostReaction, PostComment
from app.models.student_board import StudentBoardPost, StudentBoardResponse
from app.models.messaging import Conversation, ConversationMember, Message
from app.models.notification import Notification
from app.models.referral import Referral


async def reset_db():
    print("[RESET] Dropping all existing tables and re-creating empty database schema...")
    try:
        async with engine.begin() as conn:
            # Drop all tables
            await conn.run_sync(Base.metadata.drop_all)
            print("[RESET] All tables dropped.")
            
            # Re-create all clean empty tables
            await conn.run_sync(Base.metadata.create_all)
            print("[RESET] All clean empty tables created successfully.")

        print("[SUCCESS] Database has been 100% reset! Zero test data remains.")
        print("[SUCCESS] Ready for real user signups!")
    except Exception as e:
        print(f"[ERROR] Error resetting database: {e}")


if __name__ == "__main__":
    asyncio.run(reset_db())
