from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.student_board import StudentBoardPost, StudentBoardResponse
from app.core.auth import get_current_user

router = APIRouter(prefix="/student-board", tags=["Student Board"])


class StudentPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    domain: str = Field("General")


class StudentResponseCreate(BaseModel):
    content: str = Field(..., min_length=2)


@router.get("")
async def list_student_board_posts(
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(StudentBoardPost).options(
        joinedload(StudentBoardPost.student).joinedload(User.profile),
        selectinload(StudentBoardPost.responses).joinedload(StudentBoardResponse.alumni).joinedload(User.profile)
    )

    if domain:
        query = query.where(StudentBoardPost.domain.ilike(f"%{domain}%"))

    result = await db.execute(query.order_by(StudentBoardPost.created_at.desc()))
    posts = result.scalars().unique().all()

    return [
        {
            "id": str(p.id),
            "student_id": str(p.student_id),
            "student_name": p.student.full_name,
            "student_department": p.student.profile.department if p.student.profile else None,
            "student_avatar": p.student.profile.avatar_url if p.student.profile else None,
            "title": p.title,
            "content": p.content,
            "domain": p.domain,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
            "responses_count": len(p.responses),
            "responses": [
                {
                    "id": str(r.id),
                    "alumni_id": str(r.alumni_id),
                    "alumni_name": r.alumni.full_name,
                    "alumni_company": r.alumni.profile.current_company if r.alumni.profile else None,
                    "alumni_avatar": r.alumni.profile.avatar_url if r.alumni.profile else None,
                    "content": r.content,
                    "created_at": r.created_at.isoformat()
                }
                for r in sorted(p.responses, key=lambda x: x.created_at)
            ]
        }
        for p in posts
    ]


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_student_board_post(
    data: StudentPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only students can post to Student Board")

    post = StudentBoardPost(
        student_id=current_user.id,
        title=data.title,
        content=data.content,
        domain=data.domain,
        status="open"
    )
    db.add(post)
    await db.commit()
    return {"message": "Question posted successfully", "id": str(post.id)}


@router.post("/{post_id}/respond")
async def respond_to_student_board_post(
    post_id: uuid.UUID,
    data: StudentResponseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StudentBoardPost).where(StudentBoardPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Student board post not found")

    response = StudentBoardResponse(
        post_id=post_id,
        alumni_id=current_user.id,
        content=data.content
    )
    db.add(response)
    post.status = "answered"
    await db.commit()
    return {"message": "Response submitted successfully"}
