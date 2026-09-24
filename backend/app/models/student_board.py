from sqlalchemy import String, DateTime, Text, ForeignKey, Uuid, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List
import uuid
from app.db.base import Base, UUIDMixin


class StudentBoardPost(Base, UUIDMixin):
    """
    Student Board Post Model.
    Students post career bottlenecks or guidance requests (e.g., resume review, interview guidance).
    """
    __tablename__ = "student_board_posts"

    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)  # open, answered, resolved

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

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id])
    responses: Mapped[List["StudentBoardResponse"]] = relationship("StudentBoardResponse", back_populates="post", cascade="all, delete-orphan")


class StudentBoardResponse(Base, UUIDMixin):
    """Alumni responses to Student Board posts."""
    __tablename__ = "student_board_responses"

    post_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("student_board_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
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

    post: Mapped["StudentBoardPost"] = relationship("StudentBoardPost", back_populates="responses")
    alumni: Mapped["User"] = relationship("User", foreign_keys=[alumni_id])
