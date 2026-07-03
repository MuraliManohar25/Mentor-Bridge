"""
Pydantic schemas for meetings.
"""
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime, timezone
from typing import Optional
import uuid
from app.models.meeting import MeetingStatus


class MeetingCreate(BaseModel):
    """Schema for creating a meeting."""
    student_id: uuid.UUID = Field(..., description="ID of the student")
    alumni_id: uuid.UUID = Field(..., description="ID of the alumni")
    mentorship_request_id: Optional[uuid.UUID] = Field(None, description="ID of the related mentorship request")
    title: str = Field(..., min_length=5, max_length=200, description="Meeting title")
    description: Optional[str] = Field(None, max_length=1000, description="Meeting description")
    scheduled_at: datetime = Field(..., description="Scheduled date and time")
    duration_minutes: int = Field(..., ge=15, le=180, description="Duration in minutes (15-180)")
    meeting_link: Optional[str] = Field(None, max_length=500, description="Meeting link (Zoom, Google Meet, etc.)")

    @field_validator("scheduled_at")
    @classmethod
    def scheduled_at_must_be_future(cls, value: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        compare_value = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        if compare_value <= now:
            raise ValueError("Meeting must be scheduled for a future date and time")
        return value


class MeetingUpdate(BaseModel):
    """Schema for updating a meeting."""
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=180)
    meeting_link: Optional[str] = Field(None, max_length=500)
    status: Optional[MeetingStatus] = None


class MeetingResponse(BaseModel):
    """Schema for meeting response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    student_id: uuid.UUID
    alumni_id: uuid.UUID
    mentorship_request_id: Optional[uuid.UUID]
    title: str
    description: Optional[str]
    scheduled_at: datetime
    duration_minutes: int
    meeting_link: Optional[str]
    status: MeetingStatus
    created_at: datetime
    updated_at: datetime
    
    # Nested user info (populated from relationships)
    student_name: Optional[str] = None
    alumni_name: Optional[str] = None


class MeetingWithDetails(MeetingResponse):
    """Extended schema with full user details."""
    student_email: Optional[str] = None
    student_department: Optional[str] = None
    alumni_company: Optional[str] = None
    alumni_position: Optional[str] = None
