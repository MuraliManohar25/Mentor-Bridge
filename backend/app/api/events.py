from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import joinedload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.event import Event, EventRSVP, EventStatus
from app.schemas.event import EventCreate, EventOut, EventStatusUpdate
from app.core.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/events", tags=["Events"])


async def _event_to_out(event: Event, user_id: Optional[uuid.UUID], db: AsyncSession) -> EventOut:
    count_result = await db.execute(
        select(func.count(EventRSVP.id)).where(EventRSVP.event_id == event.id)
    )
    attendees = count_result.scalar() or 0

    is_rsvped = False
    if user_id:
        rsvp_result = await db.execute(
            select(EventRSVP).where(
                and_(EventRSVP.event_id == event.id, EventRSVP.user_id == user_id)
            )
        )
        is_rsvped = rsvp_result.scalar_one_or_none() is not None

    return EventOut(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        event_time=event.event_time,
        location=event.location,
        status=event.status,
        organizer_id=event.organizer_id,
        organizer_name=event.organizer.full_name if event.organizer else None,
        attendees=attendees,
        is_rsvped=is_rsvped,
        created_at=event.created_at,
    )


@router.get("", response_model=List[EventOut])
async def list_events(
    include_pending: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List approved events for dashboards; admins can include pending."""
    query = select(Event).options(joinedload(Event.organizer))

    if current_user and current_user.role == UserRole.ADMIN and include_pending:
        query = query.where(Event.status.in_([EventStatus.PENDING, EventStatus.APPROVED]))
    else:
        query = query.where(Event.status == EventStatus.APPROVED)

    query = query.order_by(Event.event_date.asc())
    result = await db.execute(query)
    events = result.scalars().unique().all()

    user_id = current_user.id if current_user else None
    return [await _event_to_out(event, user_id, db) for event in events]


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alumni schedule an event (pending admin approval)."""
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(status_code=403, detail="Only alumni can schedule events")

    event = Event(
        title=event_data.title,
        description=event_data.description,
        event_date=event_data.event_date,
        event_time=event_data.event_time,
        location=event_data.location,
        organizer_id=current_user.id,
        status=EventStatus.PENDING,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    result = await db.execute(
        select(Event).options(joinedload(Event.organizer)).where(Event.id == event.id)
    )
    created = result.scalar_one()
    return await _event_to_out(created, current_user.id, db)


@router.patch("/{event_id}/status", response_model=EventOut)
async def update_event_status(
    event_id: uuid.UUID,
    update: EventStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin approves or rejects an event."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.execute(
        select(Event).options(joinedload(Event.organizer)).where(Event.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.status = update.status
    await db.commit()
    await db.refresh(event)
    return await _event_to_out(event, current_user.id, db)


@router.post("/{event_id}/rsvp", response_model=EventOut)
async def toggle_rsvp(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student RSVP toggle for an approved event."""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can RSVP to events")

    result = await db.execute(
        select(Event).options(joinedload(Event.organizer)).where(Event.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event or event.status != EventStatus.APPROVED:
        raise HTTPException(status_code=404, detail="Event not found or not available")

    rsvp_result = await db.execute(
        select(EventRSVP).where(
            and_(EventRSVP.event_id == event_id, EventRSVP.user_id == current_user.id)
        )
    )
    existing = rsvp_result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
    else:
        db.add(EventRSVP(event_id=event_id, user_id=current_user.id))

    await db.commit()
    return await _event_to_out(event, current_user.id, db)
