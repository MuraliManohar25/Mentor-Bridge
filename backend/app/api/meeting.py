"""
Meeting API Router.

Handles meeting creation, retrieval, and status updates for mentorship interactions.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import joinedload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.meeting import Meeting, MeetingStatus
from app.models.mentorship import MentorshipRequest, MentorshipStatus as MentorshipRequestStatus
from app.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    MeetingWithDetails
)
from app.core.auth import get_current_user
from app.websockets.manager import connection_manager

router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new meeting.
    
    Students and alumni can schedule meetings with each other.
    Requires an active mentorship relationship.
    """
    # Verify both users exist
    student_query = select(User).where(User.id == meeting_data.student_id)
    student_result = await db.execute(student_query)
    student = student_result.scalar_one_or_none()
    
    alumni_query = select(User).where(User.id == meeting_data.alumni_id)
    alumni_result = await db.execute(alumni_query)
    alumni = alumni_result.scalar_one_or_none()
    
    if not student or not alumni:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify roles
    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID must be a student"
        )
    
    if alumni.role != UserRole.ALUMNI:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alumni ID must be an alumni"
        )
    
    # Verify mentorship relationship exists and is accepted
    if meeting_data.mentorship_request_id:
        mentorship_query = select(MentorshipRequest).where(
            and_(
                MentorshipRequest.id == meeting_data.mentorship_request_id,
                MentorshipRequest.student_id == meeting_data.student_id,
                MentorshipRequest.alumni_id == meeting_data.alumni_id,
                MentorshipRequest.status == MentorshipRequestStatus.ACCEPTED
            )
        )
        mentorship_result = await db.execute(mentorship_query)
        if not mentorship_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active mentorship relationship found"
            )
    else:
        # Check if there's any accepted mentorship between these users
        mentorship_query = select(MentorshipRequest).where(
            and_(
                MentorshipRequest.student_id == meeting_data.student_id,
                MentorshipRequest.alumni_id == meeting_data.alumni_id,
                MentorshipRequest.status == MentorshipRequestStatus.ACCEPTED
            )
        )
        mentorship_result = await db.execute(mentorship_query)
        if not mentorship_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must have an active mentorship relationship to schedule meetings"
            )
    
    # Verify current user is either the student or alumni
    if current_user.id != meeting_data.student_id and current_user.id != meeting_data.alumni_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only schedule meetings for yourself"
        )
    
    # Create meeting
    meeting = Meeting(
        student_id=meeting_data.student_id,
        alumni_id=meeting_data.alumni_id,
        mentorship_request_id=meeting_data.mentorship_request_id,
        title=meeting_data.title,
        description=meeting_data.description,
        scheduled_at=meeting_data.scheduled_at,
        duration_minutes=meeting_data.duration_minutes,
        meeting_link=meeting_data.meeting_link,
        status=MeetingStatus.SCHEDULED
    )
    
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    
    # Send WebSocket notification to the other party
    recipient_id = meeting_data.alumni_id if current_user.id == meeting_data.student_id else meeting_data.student_id
    await connection_manager.send_to_user(
        user_id=recipient_id,
        message={
            "type": "meeting_scheduled",
            "data": {
                "meeting_id": str(meeting.id),
                "title": meeting.title,
                "scheduled_at": meeting.scheduled_at.isoformat(),
                "duration_minutes": meeting.duration_minutes,
                "sender_name": current_user.full_name
            }
        }
    )
    
    return meeting


@router.get("", response_model=List[MeetingWithDetails])
async def get_meetings(
    status_filter: Optional[MeetingStatus] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get meetings for the current user.
    
    Returns all meetings where the user is either the student or alumni.
    """
    # Build query based on user role
    query = select(Meeting).where(
        or_(
            Meeting.student_id == current_user.id,
            Meeting.alumni_id == current_user.id
        )
    )
    
    # Apply status filter
    if status_filter:
        query = query.where(Meeting.status == status_filter)
    
    # Load related users
    query = query.options(
        joinedload(Meeting.student).joinedload(User.profile),
        joinedload(Meeting.alumni).joinedload(User.profile)
    )
    
    # Apply pagination and ordering
    query = query.order_by(Meeting.scheduled_at.asc())
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    meetings = result.scalars().all()
    
    # Enrich with user details
    enriched_meetings = []
    for meeting in meetings:
        meeting_dict = {
            "id": meeting.id,
            "student_id": meeting.student_id,
            "alumni_id": meeting.alumni_id,
            "mentorship_request_id": meeting.mentorship_request_id,
            "title": meeting.title,
            "description": meeting.description,
            "scheduled_at": meeting.scheduled_at,
            "duration_minutes": meeting.duration_minutes,
            "meeting_link": meeting.meeting_link,
            "status": meeting.status,
            "created_at": meeting.created_at,
            "updated_at": meeting.updated_at,
            "student_name": meeting.student.full_name if meeting.student else None,
            "alumni_name": meeting.alumni.full_name if meeting.alumni else None,
            "student_email": meeting.student.email if meeting.student else None,
            "student_department": meeting.student.profile.department if meeting.student and meeting.student.profile else None,
            "alumni_company": meeting.alumni.profile.current_company if meeting.alumni and meeting.alumni.profile else None,
            "alumni_position": meeting.alumni.profile.current_position if meeting.alumni and meeting.alumni.profile else None,
        }
        enriched_meetings.append(MeetingWithDetails(**meeting_dict))
    
    return enriched_meetings


@router.get("/{meeting_id}", response_model=MeetingWithDetails)
async def get_meeting(
    meeting_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific meeting by ID.
    
    User must be either the student or alumni involved in the meeting.
    """
    query = select(Meeting).where(
        and_(
            Meeting.id == meeting_id,
            or_(
                Meeting.student_id == current_user.id,
                Meeting.alumni_id == current_user.id
            )
        )
    ).options(
        joinedload(Meeting.student).joinedload(User.profile),
        joinedload(Meeting.alumni).joinedload(User.profile)
    )
    
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Enrich with user details
    meeting_dict = {
        "id": meeting.id,
        "student_id": meeting.student_id,
        "alumni_id": meeting.alumni_id,
        "mentorship_request_id": meeting.mentorship_request_id,
        "title": meeting.title,
        "description": meeting.description,
        "scheduled_at": meeting.scheduled_at,
        "duration_minutes": meeting.duration_minutes,
        "meeting_link": meeting.meeting_link,
        "status": meeting.status,
        "created_at": meeting.created_at,
        "updated_at": meeting.updated_at,
        "student_name": meeting.student.full_name if meeting.student else None,
        "alumni_name": meeting.alumni.full_name if meeting.alumni else None,
        "student_email": meeting.student.email if meeting.student else None,
        "student_department": meeting.student.profile.department if meeting.student and meeting.student.profile else None,
        "alumni_company": meeting.alumni.profile.current_company if meeting.alumni and meeting.alumni.profile else None,
        "alumni_position": meeting.alumni.profile.current_position if meeting.alumni and meeting.alumni.profile else None,
    }
    
    return MeetingWithDetails(**meeting_dict)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: uuid.UUID,
    update_data: MeetingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a meeting.
    
    Only the meeting creator can update the meeting.
    """
    query = select(Meeting).where(
        and_(
            Meeting.id == meeting_id,
            or_(
                Meeting.student_id == current_user.id,
                Meeting.alumni_id == current_user.id
            )
        )
    )
    
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(meeting, field, value)
    
    await db.commit()
    await db.refresh(meeting)
    
    # Send notification if status changed
    if "status" in update_dict:
        recipient_id = meeting.alumni_id if current_user.id == meeting.student_id else meeting.student_id
        await connection_manager.send_to_user(
            user_id=recipient_id,
            message={
                "type": "meeting_updated",
                "data": {
                    "meeting_id": str(meeting.id),
                    "status": meeting.status.value,
                    "title": meeting.title,
                    "updated_by": current_user.full_name
                }
            }
        )
    
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a meeting.
    
    Only the meeting creator can delete the meeting.
    """
    query = select(Meeting).where(
        and_(
            Meeting.id == meeting_id,
            or_(
                Meeting.student_id == current_user.id,
                Meeting.alumni_id == current_user.id
            )
        )
    )
    
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    await db.delete(meeting)
    await db.commit()
    
    # Send notification to the other party
    recipient_id = meeting.alumni_id if current_user.id == meeting.student_id else meeting.student_id
    await connection_manager.send_to_user(
        user_id=recipient_id,
        message={
            "type": "meeting_cancelled",
            "data": {
                "meeting_id": str(meeting.id),
                "title": meeting.title,
                "cancelled_by": current_user.full_name
            }
        }
    )
