from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
import uuid
from app.models.announcement import AnnouncementPriority


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    priority: AnnouncementPriority = AnnouncementPriority.MEDIUM
    type: Optional[str] = None  # frontend alias for priority mapping


class AnnouncementOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    priority: AnnouncementPriority
    created_by_id: uuid.UUID
    created_by_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
