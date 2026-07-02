import asyncio
import sys
import os

# Override environment variable before importing config
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./mentor_bridge.db"

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

async def main():
    from app.db.session import AsyncSessionLocal
    from app.models.user import User
    from sqlalchemy import select
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"Email: {u.email}")
            print(f"  SQLAlchemy role object: {u.role}")
            print(f"  Role type: {type(u.role)}")
            print(f"  Role value: {u.role.value if hasattr(u.role, 'value') else u.role}")

if __name__ == "__main__":
    asyncio.run(main())
