from sqlalchemy import String, DateTime, Enum as SQLEnum, Text, ForeignKey, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from enum import Enum
from typing import Optional, List
import uuid
from app.db.base import Base, UUIDMixin


class JobType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    INTERNSHIP = "internship"
    CONTRACT = "contract"


class JobCategory(str, Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    OVERSEAS = "overseas"


class JobStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"


class Job(Base, UUIDMixin):
    __tablename__ = "jobs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    job_type: Mapped[JobType] = mapped_column(
        SQLEnum(JobType, name="job_type", native_enum=False),
        nullable=False,
        default=JobType.FULL_TIME,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True, default=list)
    apply_link: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[JobCategory] = mapped_column(
        SQLEnum(JobCategory, name="job_category", native_enum=False),
        nullable=False,
        default=JobCategory.INTERNAL,
    )
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    salary_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus, name="job_status", native_enum=False),
        nullable=False,
        default=JobStatus.ACTIVE,
    )
    posted_by_id: Mapped[uuid.UUID] = mapped_column(
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

    posted_by: Mapped["User"] = relationship("User", backref="posted_jobs")
