from sqlalchemy import String, DateTime, Enum as SQLEnum, Text, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid
from app.db.base import Base, UUIDMixin


class MeetingStatus(str, Enum):
    """Meeting status enumeration."""
    PENDING = "pending"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Meeting(Base, UUIDMixin):
    """
    Meeting model for mentorship interactions.
    
    Tracks scheduled meetings between students and alumni mentors.
    """
    __tablename__ = "meetings"
    
    # Foreign Keys
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    mentorship_request_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("mentorship_requests.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Meeting Details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    
    duration_minutes: Mapped[int] = mapped_column(
        nullable=False,
        default=30
    )
    
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    status: Mapped[MeetingStatus] = mapped_column(
        SQLEnum(MeetingStatus, name="meeting_status", native_enum=False),
        nullable=False,
        default=MeetingStatus.PENDING
    )
    
    # Timestamps
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
    
    # Relationships
    student: Mapped["User"] = relationship(
        "User",
        foreign_keys=[student_id],
        backref="student_meetings"
    )
    
    alumni: Mapped["User"] = relationship(
        "User",
        foreign_keys=[alumni_id],
        backref="alumni_meetings"
    )
    
    mentorship_request: Mapped["MentorshipRequest"] = relationship(
        "MentorshipRequest",
        backref="meetings"
    )
    
    def __repr__(self) -> str:
        return f"<Meeting {self.title} ({self.status.value})>"
