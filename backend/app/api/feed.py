from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.feed import Post, PostReaction, PostComment
from app.core.auth import get_current_user

router = APIRouter(prefix="/posts", tags=["Mentor Feed Posts"])


class PostCreate(BaseModel):
    content: str = Field(..., min_length=5)
    media_url: Optional[str] = None
    post_type: str = Field("advice", description="advice, job, event, general")
    visibility: str = Field("public")


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


@router.get("")
async def get_feed_posts(
    post_type: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Post).options(
        joinedload(Post.author).joinedload(User.profile),
        selectinload(Post.reactions),
        selectinload(Post.comments).joinedload(PostComment.author).joinedload(User.profile)
    )

    if post_type:
        query = query.where(Post.post_type == post_type)

    query = query.order_by(Post.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    posts = result.scalars().unique().all()

    response = []
    for p in posts:
        has_liked = any(r.user_id == current_user.id for r in p.reactions)
        response.append({
            "id": str(p.id),
            "author_id": str(p.author_id),
            "author_name": p.author.full_name,
            "author_role": p.author.role.value,
            "author_company": p.author.profile.current_company if p.author.profile else None,
            "author_position": p.author.profile.current_position if p.author.profile else None,
            "author_avatar": p.author.profile.avatar_url if p.author.profile else None,
            "content": p.content,
            "media_url": p.media_url,
            "post_type": p.post_type,
            "likes_count": len(p.reactions),
            "comments_count": len(p.comments),
            "has_liked": has_liked,
            "created_at": p.created_at.isoformat(),
            "comments": [
                {
                    "id": str(c.id),
                    "author_id": str(c.author_id),
                    "author_name": c.author.full_name,
                    "author_avatar": c.author.profile.avatar_url if c.author.profile else None,
                    "content": c.content,
                    "created_at": c.created_at.isoformat()
                }
                for c in sorted(p.comments, key=lambda x: x.created_at)
            ]
        })
    return response


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only alumni / mentors can create mentor feed posts
    if current_user.role != UserRole.ALUMNI and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni mentors can publish career feed posts"
        )

    post = Post(
        author_id=current_user.id,
        content=data.content,
        media_url=data.media_url,
        post_type=data.post_type,
        visibility=data.visibility
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return {"message": "Post created successfully", "id": str(post.id)}


@router.get("/{post_id}")
async def get_single_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Post).where(Post.id == post_id).options(
        joinedload(Post.author).joinedload(User.profile),
        selectinload(Post.reactions),
        selectinload(Post.comments).joinedload(PostComment.author).joinedload(User.profile)
    )
    result = await db.execute(query)
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    has_liked = any(r.user_id == current_user.id for r in post.reactions)
    return {
        "id": str(post.id),
        "author_id": str(post.author_id),
        "author_name": post.author.full_name,
        "author_role": post.author.role.value,
        "author_company": post.author.profile.current_company if post.author.profile else None,
        "author_position": post.author.profile.current_position if post.author.profile else None,
        "author_avatar": post.author.profile.avatar_url if post.author.profile else None,
        "content": post.content,
        "media_url": post.media_url,
        "post_type": post.post_type,
        "likes_count": len(post.reactions),
        "comments_count": len(post.comments),
        "has_liked": has_liked,
        "created_at": post.created_at.isoformat(),
        "comments": [
            {
                "id": str(c.id),
                "author_id": str(c.author_id),
                "author_name": c.author.full_name,
                "author_avatar": c.author.profile.avatar_url if c.author.profile else None,
                "content": c.content,
                "created_at": c.created_at.isoformat()
            }
            for c in sorted(post.comments, key=lambda x: x.created_at)
        ]
    }


@router.post("/{post_id}/react")
async def toggle_post_reaction(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PostReaction).where(
            and_(PostReaction.post_id == post_id, PostReaction.user_id == current_user.id)
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"liked": False, "message": "Unliked post"}
    else:
        reaction = PostReaction(post_id=post_id, user_id=current_user.id, reaction_type="like")
        db.add(reaction)
        await db.commit()
        return {"liked": True, "message": "Liked post"}


@router.post("/{post_id}/comments")
async def add_post_comment(
    post_id: uuid.UUID,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    comment = PostComment(post_id=post_id, author_id=current_user.id, content=data.content)
    db.add(comment)
    await db.commit()
    return {"message": "Comment added successfully"}
