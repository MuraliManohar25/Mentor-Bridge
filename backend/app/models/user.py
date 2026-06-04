from sqlalchemy import String, DateTime, Enum as SQLEnum, Boolean, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from enum import Enum
from typing import Optional, List
import uuid
from app.db.base import Base, UUIDMixin


class UserRole(str, Enum):
    """User role enumeration - restricted to admin, alumni, and student only."""
    ADMIN = "admin"
    ALUMNI = "alumni"
    STUDENT = "student"


class User(Base, UUIDMixin):
    """
    User model for GradConnect platform.
    
    Supports three stakeholder roles:
    - Admin: Platform administrators
    - Alumni: Graduated students
    - Student: Current students
    """
    __tablename__ = "users"
    
    # Authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Role
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role", native_enum=False),
        nullable=False,
        default=UserRole.STUDENT
    )
    
    # Profile Information
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
    )  # "pending", "verified", "rejected"
    
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
    profile: Mapped["Profile"] = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"


class Profile(Base, UUIDMixin):
    """
    User profile model with role-specific fields.
    
    Base fields for all users:
    - bio, avatar_url, graduation_year, department
    
    Alumni-specific fields:
    - current_company, current_position, is_mentor, mentorship_expertise
    
    Student-specific fields:
    - interests
    """
    __tablename__ = "profiles"
    
    # Foreign Key
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Base Profile Fields (All Users)
    bio: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Alumni-Specific Fields
    current_company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    current_position: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_mentor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mentorship_expertise: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
        default=list
    )
    
    # Student-Specific Fields
    interests: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
        default=list
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
    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile"
    )
    
    def __repr__(self) -> str:
        return f"<Profile for user_id={self.user_id}>"

