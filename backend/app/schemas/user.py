from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.user import UserRole


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    graduation_year: Optional[int] = None
    department: Optional[str] = None


class UserOut(UserBase):
    """Schema for user response (excludes password)."""
    id: uuid.UUID
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Profile Schemas
# ============================================================================

class ProfileBase(BaseModel):
    """Base profile schema."""
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    graduation_year: Optional[int] = Field(None, ge=1900, le=2100)
    department: Optional[str] = Field(None, max_length=255)


class ProfileCreate(ProfileBase):
    """Schema for profile creation."""
    # Alumni-specific
    current_company: Optional[str] = Field(None, max_length=255)
    current_position: Optional[str] = Field(None, max_length=255)
    is_mentor: bool = False
    mentorship_expertise: Optional[List[str]] = Field(default_factory=list)
    
    # Student-specific
    interests: Optional[List[str]] = Field(default_factory=list)


class ProfileUpdate(ProfileBase):
    """Schema for profile updates."""
    # Alumni-specific
    current_company: Optional[str] = Field(None, max_length=255)
    current_position: Optional[str] = Field(None, max_length=255)
    is_mentor: Optional[bool] = None
    mentorship_expertise: Optional[List[str]] = None
    
    # Student-specific
    interests: Optional[List[str]] = None


class ProfileOut(ProfileBase):
    """Schema for profile response."""
    id: uuid.UUID
    user_id: uuid.UUID
    
    # Alumni-specific
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    is_mentor: bool
    mentorship_expertise: Optional[List[str]] = None
    
    # Student-specific
    interests: Optional[List[str]] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Combined User + Profile Schemas
# ============================================================================

class UserWithProfile(UserOut):
    """User response with embedded profile."""
    profile: Optional[ProfileOut] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Authentication Schemas
# ============================================================================

class Token(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token payload."""
    user_id: Optional[uuid.UUID] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
    role: UserRole  # Role selection from dropdown


class LoginResponse(BaseModel):
    """Login response with tokens and user data."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserWithProfile


# ============================================================================
# Alumni Discovery Schemas
# ============================================================================

class AlumniPublicOut(BaseModel):
    """
    Public-facing alumni profile for discovery.
    Excludes sensitive fields like hashed_password.
    """
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    created_at: datetime
    profile: Optional[ProfileOut] = None
    
    model_config = ConfigDict(from_attributes=True)


class AlumniSearchResponse(BaseModel):
    """Paginated response for alumni search."""
    total: int
    limit: int
    offset: int
    results: List[AlumniPublicOut]


class MentorStatusUpdate(BaseModel):
    """Schema for updating mentor availability status."""
    is_mentor: bool

