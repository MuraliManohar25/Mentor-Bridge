from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.job import JobType, JobCategory, JobStatus


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    job_type: JobType = JobType.FULL_TIME
    description: str = Field(..., min_length=1)
    requirements: List[str] = Field(default_factory=list)
    apply_link: str = Field(..., min_length=1, max_length=500)
    category: JobCategory = JobCategory.INTERNAL
    country: Optional[str] = None
    salary_range: Optional[str] = None


class OverseasJobCreate(BaseModel):
    title: str
    company: str
    country: str
    description: str
    requirements: List[str] = Field(default_factory=list)
    salary_range: Optional[str] = None
    status: JobStatus = JobStatus.ACTIVE


class JobStatusUpdate(BaseModel):
    status: JobStatus


class JobOut(BaseModel):
    id: uuid.UUID
    title: str
    company: str
    location: str
    job_type: JobType
    description: str
    requirements: Optional[List[str]] = None
    apply_link: str
    category: JobCategory
    country: Optional[str] = None
    salary_range: Optional[str] = None
    status: JobStatus
    posted_by_id: uuid.UUID
    posted_by_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
