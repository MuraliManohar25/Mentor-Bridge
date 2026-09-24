from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.community import Circle, CircleMember, CirclePost, CircleSession
from app.core.auth import get_current_user
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

router = APIRouter(prefix="/circles", tags=["Community Mentorship Circles"])


class CircleCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=10)
    domain: str = Field(..., min_length=2, max_length=100)
    capacity: int = Field(20, ge=2, le=500)
    schedule: Optional[str] = None
    cover_image: Optional[str] = None


class CirclePostCreate(BaseModel):
    content: str = Field(..., min_length=1)


class CircleSessionCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    scheduled_at: datetime
    meeting_link: Optional[str] = None


@router.get("")
async def list_circles(
    domain: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Circle).options(
        joinedload(Circle.owner).joinedload(User.profile),
        selectinload(Circle.members)
    )

    if domain:
        query = query.where(Circle.domain.ilike(f"%{domain}%"))
    if search:
        query = query.where(
            Circle.title.ilike(f"%{search}%") | Circle.description.ilike(f"%{search}%")
        )

    result = await db.execute(query.order_by(Circle.created_at.desc()))
    circles = result.scalars().unique().all()

    response = []
    for c in circles:
        is_member = any(m.user_id == current_user.id for m in c.members)
        response.append({
            "id": str(c.id),
            "title": c.title,
            "description": c.description,
            "domain": c.domain,
            "owner_id": str(c.owner_id),
            "owner_name": c.owner.full_name if c.owner else "Mentor",
            "owner_company": c.owner.profile.current_company if c.owner and c.owner.profile else None,
            "owner_avatar": c.owner.profile.avatar_url if c.owner and c.owner.profile else None,
            "capacity": c.capacity,
            "current_members_count": len(c.members),
            "schedule": c.schedule,
            "cover_image": c.cover_image,
            "is_member": is_member,
            "created_at": c.created_at.isoformat()
        })
    return response


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_circle(
    data: CircleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    circle = Circle(
        title=data.title,
        description=data.description,
        domain=data.domain,
        owner_id=current_user.id,
        capacity=data.capacity,
        current_members_count=1,
        schedule=data.schedule,
        cover_image=data.cover_image
    )
    db.add(circle)
    await db.flush()

    member = CircleMember(circle_id=circle.id, user_id=current_user.id)
    db.add(member)
    await db.commit()

    return {"message": "Circle created successfully", "circle_id": str(circle.id)}


@router.get("/{circle_id}")
async def get_circle_detail(
    circle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Circle).where(Circle.id == circle_id).options(
        joinedload(Circle.owner).joinedload(User.profile),
        selectinload(Circle.members).joinedload(CircleMember.user).joinedload(User.profile),
        selectinload(Circle.posts).joinedload(CirclePost.author).joinedload(User.profile),
        selectinload(Circle.sessions)
    )
    result = await db.execute(query)
    circle = result.scalar_one_or_none()
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")

    is_member = any(m.user_id == current_user.id for m in circle.members)

    return {
        "id": str(circle.id),
        "title": circle.title,
        "description": circle.description,
        "domain": circle.domain,
        "owner_id": str(circle.owner_id),
        "owner_name": circle.owner.full_name if circle.owner else "Mentor",
        "owner_company": circle.owner.profile.current_company if circle.owner and circle.owner.profile else None,
        "owner_position": circle.owner.profile.current_position if circle.owner and circle.owner.profile else None,
        "owner_avatar": circle.owner.profile.avatar_url if circle.owner and circle.owner.profile else None,
        "capacity": circle.capacity,
        "current_members_count": len(circle.members),
        "schedule": circle.schedule,
        "cover_image": circle.cover_image,
        "is_member": is_member,
        "is_owner": circle.owner_id == current_user.id,
        "created_at": circle.created_at.isoformat(),
        "members": [
            {
                "id": str(m.user_id),
                "full_name": m.user.full_name,
                "role": m.user.role.value,
                "avatar_url": m.user.profile.avatar_url if m.user.profile else None,
                "department": m.user.profile.department if m.user.profile else None
            }
            for m in circle.members
        ],
        "posts": [
            {
                "id": str(p.id),
                "content": p.content,
                "author_id": str(p.author_id),
                "author_name": p.author.full_name,
                "author_avatar": p.author.profile.avatar_url if p.author.profile else None,
                "created_at": p.created_at.isoformat()
            }
            for p in sorted(circle.posts, key=lambda x: x.created_at, reverse=True)
        ],
        "sessions": [
            {
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "scheduled_at": s.scheduled_at.isoformat(),
                "meeting_link": s.meeting_link
            }
            for s in sorted(circle.sessions, key=lambda x: x.scheduled_at)
        ]
    }


@router.post("/{circle_id}/join")
async def join_circle(
    circle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Circle).where(Circle.id == circle_id).options(selectinload(Circle.members)))
    circle = result.scalar_one_or_none()
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")

    if any(m.user_id == current_user.id for m in circle.members):
        return {"message": "Already a member"}

    if len(circle.members) >= circle.capacity:
        raise HTTPException(status_code=400, detail="Circle is at full capacity")

    member = CircleMember(circle_id=circle.id, user_id=current_user.id)
    db.add(member)
    circle.current_members_count = len(circle.members) + 1
    await db.commit()

    return {"message": "Joined circle successfully"}


@router.post("/{circle_id}/posts")
async def add_circle_post(
    circle_id: uuid.UUID,
    data: CirclePostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post = CirclePost(circle_id=circle_id, author_id=current_user.id, content=data.content)
    db.add(post)
    await db.commit()
    return {"message": "Post added to circle"}
