from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import List

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.announcement import Announcement, AnnouncementPriority
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut
from app.core.auth import get_current_user

router = APIRouter(prefix="/announcements", tags=["Announcements"])


def _announcement_to_out(announcement: Announcement) -> AnnouncementOut:
    return AnnouncementOut(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        priority=announcement.priority,
        created_by_id=announcement.created_by_id,
        created_by_name=announcement.created_by.full_name if announcement.created_by else None,
        created_at=announcement.created_at,
    )


@router.get("", response_model=List[AnnouncementOut])
async def list_announcements(db: AsyncSession = Depends(get_db)):
    """Public list of platform announcements."""
    result = await db.execute(
        select(Announcement)
        .options(joinedload(Announcement.created_by))
        .order_by(Announcement.created_at.desc())
    )
    items = result.scalars().unique().all()
    return [_announcement_to_out(item) for item in items]


@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin creates a platform announcement."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    priority = data.priority
    if data.type == "warning":
        priority = AnnouncementPriority.HIGH
    elif data.type == "success":
        priority = AnnouncementPriority.LOW

    announcement = Announcement(
        title=data.title,
        content=data.content,
        priority=priority,
        created_by_id=current_user.id,
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)

    result = await db.execute(
        select(Announcement)
        .options(joinedload(Announcement.created_by))
        .where(Announcement.id == announcement.id)
    )
    created = result.scalar_one()
    return _announcement_to_out(created)
