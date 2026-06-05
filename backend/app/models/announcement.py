from sqlalchemy import String, DateTime, Enum as SQLEnum, Text, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from enum import Enum
import uuid
from app.db.base import Base, UUIDMixin


class AnnouncementPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Announcement(Base, UUIDMixin):
    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[AnnouncementPriority] = mapped_column(
        SQLEnum(AnnouncementPriority, name="announcement_priority", native_enum=False),
        nullable=False,
        default=AnnouncementPriority.MEDIUM,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    created_by: Mapped["User"] = relationship("User", backref="announcements")
