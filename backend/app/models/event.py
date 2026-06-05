from sqlalchemy import String, DateTime, Enum as SQLEnum, Text, ForeignKey, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from enum import Enum
import uuid
from app.db.base import Base, UUIDMixin


class EventStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Event(Base, UUIDMixin):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    event_date: Mapped[str] = mapped_column(String(20), nullable=False)
    event_time: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[EventStatus] = mapped_column(
        SQLEnum(EventStatus, name="event_status", native_enum=False),
        nullable=False,
        default=EventStatus.PENDING,
    )
    organizer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    organizer: Mapped["User"] = relationship("User", backref="organized_events")
    rsvps: Mapped[list["EventRSVP"]] = relationship(
        "EventRSVP", back_populates="event", cascade="all, delete-orphan"
    )


class EventRSVP(Base, UUIDMixin):
    __tablename__ = "event_rsvps"
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_event_user_rsvp"),)

    event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="rsvps")
    user: Mapped["User"] = relationship("User", backref="event_rsvps")
