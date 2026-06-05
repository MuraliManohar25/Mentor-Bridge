from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
import uuid
from app.models.event import EventStatus


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    event_date: str
    event_time: str
    location: str = Field(..., min_length=1, max_length=255)


class EventStatusUpdate(BaseModel):
    status: EventStatus


class EventOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: str
    location: str
    status: EventStatus
    organizer_id: uuid.UUID
    organizer_name: Optional[str] = None
    attendees: int = 0
    is_rsvped: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
