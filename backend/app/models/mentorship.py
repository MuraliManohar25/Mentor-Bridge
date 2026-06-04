from sqlalchemy import String, DateTime, Enum as SQLEnum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid
from app.db.base import Base, UUIDMixin


class MentorshipStatus(str, Enum):
    """Mentorship request status enumeration."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"


class MentorshipRequest(Base, UUIDMixin):
    """
    Mentorship request model.
    
    Tracks mentorship requests from students to alumni mentors.
    """
    __tablename__ = "mentorship_requests"
    
    # Foreign Keys
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Request Details
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    status: Mapped[MentorshipStatus] = mapped_column(
        SQLEnum(MentorshipStatus, name="mentorship_status", native_enum=False),
        nullable=False,
        default=MentorshipStatus.PENDING
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
        backref="sent_mentorship_requests"
    )
    
    alumni: Mapped["User"] = relationship(
        "User",
        foreign_keys=[alumni_id],
        backref="received_mentorship_requests"
    )
    
    def __repr__(self) -> str:
        return f"<MentorshipRequest {self.student_id} -> {self.alumni_id} ({self.status.value})>"
