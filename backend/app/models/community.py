from sqlalchemy import String, DateTime, Text, Integer, ForeignKey, Uuid, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List
import uuid
from app.db.base import Base, UUIDMixin


class Circle(Base, UUIDMixin):
    """
    Community Mentorship Circle Model.
    Serves as group mentorship fallback & scalable community support.
    """
    __tablename__ = "circles"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    capacity: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    current_members_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    schedule: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])
    members: Mapped[List["CircleMember"]] = relationship("CircleMember", back_populates="circle", cascade="all, delete-orphan")
    posts: Mapped[List["CirclePost"]] = relationship("CirclePost", back_populates="circle", cascade="all, delete-orphan")
    sessions: Mapped[List["CircleSession"]] = relationship("CircleSession", back_populates="circle", cascade="all, delete-orphan")


class CircleMember(Base, UUIDMixin):
    """Circle Membership join table."""
    __tablename__ = "circle_members"

    circle_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("circles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    circle: Mapped["Circle"] = relationship("Circle", back_populates="members")
    user: Mapped["User"] = relationship("User")


class CirclePost(Base, UUIDMixin):
    """Post inside a Community Circle."""
    __tablename__ = "circle_posts"

    circle_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("circles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    circle: Mapped["Circle"] = relationship("Circle", back_populates="posts")
    author: Mapped["User"] = relationship("User")


class CircleSession(Base, UUIDMixin):
    """Scheduled session or meeting for a Circle."""
    __tablename__ = "circle_sessions"

    circle_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("circles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    circle: Mapped["Circle"] = relationship("Circle", back_populates="sessions")
