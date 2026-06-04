"""
Pydantic schemas for mentorship requests.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
import uuid
from app.models.mentorship import MentorshipStatus


class MentorshipRequestCreate(BaseModel):
    """Schema for creating a mentorship request."""
    alumni_id: uuid.UUID = Field(..., description="ID of the alumni mentor")
    message: str = Field(..., min_length=10, max_length=1000, description="Message to the mentor")


class MentorshipRequestUpdate(BaseModel):
    """Schema for updating a mentorship request status."""
    status: MentorshipStatus = Field(..., description="New status for the request")


class MentorshipRequestResponse(BaseModel):
    """Schema for mentorship request response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    student_id: uuid.UUID
    alumni_id: uuid.UUID
    message: str
    status: MentorshipStatus
    created_at: datetime
    updated_at: datetime
    
    # Nested user info (populated from relationships)
    student_name: Optional[str] = None
    alumni_name: Optional[str] = None


class MentorshipRequestWithDetails(MentorshipRequestResponse):
    """Extended schema with full user details."""
    student_email: Optional[str] = None
    student_department: Optional[str] = None
    alumni_company: Optional[str] = None
    alumni_position: Optional[str] = None
