"""
Mentorship API Router.

Handles mentorship request creation, retrieval, and status updates.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import joinedload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.mentorship import MentorshipRequest, MentorshipStatus
from app.schemas.mentorship import (
    MentorshipRequestCreate,
    MentorshipRequestUpdate,
    MentorshipRequestResponse,
    MentorshipRequestWithDetails
)
from app.core.auth import get_current_user
from app.websockets.manager import connection_manager

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])


@router.post("/request", response_model=MentorshipRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_mentorship_request(
    request_data: MentorshipRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new mentorship request (students only).
    
    Students can request mentorship from alumni who have is_mentor=True.
    Sends a real-time WebSocket notification to the alumni.
    """
    # Only students can request mentorship
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can request mentorship"
        )
    
    # Verify alumni exists and is a mentor
    alumni_query = select(User).where(
        User.id == request_data.alumni_id,
        User.role == UserRole.ALUMNI,
        User.is_active == True
    ).options(joinedload(User.profile))
    
    result = await db.execute(alumni_query)
    alumni = result.scalar_one_or_none()
    
    if not alumni:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumni not found or not active"
        )
    
    if not alumni.profile or not alumni.profile.is_mentor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This alumni is not available as a mentor"
        )
    
    # Check for existing pending request
    existing_query = select(MentorshipRequest).where(
        and_(
            MentorshipRequest.student_id == current_user.id,
            MentorshipRequest.alumni_id == request_data.alumni_id,
            MentorshipRequest.status == MentorshipStatus.PENDING
        )
    )
    existing_result = await db.execute(existing_query)
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request with this alumni"
        )
    
    # Create mentorship request
    mentorship_request = MentorshipRequest(
        student_id=current_user.id,
        alumni_id=request_data.alumni_id,
        message=request_data.message,
        status=MentorshipStatus.PENDING
    )
    
    db.add(mentorship_request)
    await db.commit()
    await db.refresh(mentorship_request)
    
    # Send WebSocket notification to alumni
    await connection_manager.send_to_user(
        user_id=request_data.alumni_id,
        message={
            "type": "mentorship_request",
            "data": {
                "request_id": str(mentorship_request.id),
                "student_name": current_user.full_name,
                "student_id": str(current_user.id),
                "message": request_data.message,
                "created_at": mentorship_request.created_at.isoformat()
            }
        }
    )
    
    return mentorship_request


@router.get("/requests", response_model=List[MentorshipRequestWithDetails])
async def get_mentorship_requests(
    status_filter: Optional[MentorshipStatus] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get mentorship requests.
    
    - Alumni: See incoming requests
    - Students: See sent requests
    """
    # Build query based on user role
    if current_user.role == UserRole.ALUMNI:
        # Alumni sees incoming requests
        query = select(MentorshipRequest).where(
            MentorshipRequest.alumni_id == current_user.id
        )
    elif current_user.role == UserRole.STUDENT:
        # Students see their sent requests
        query = select(MentorshipRequest).where(
            MentorshipRequest.student_id == current_user.id
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students and alumni can access mentorship requests"
        )
    
    # Apply status filter
    if status_filter:
        query = query.where(MentorshipRequest.status == status_filter)
    
    # Load related users
    query = query.options(
        joinedload(MentorshipRequest.student).joinedload(User.profile),
        joinedload(MentorshipRequest.alumni).joinedload(User.profile)
    )
    
    # Apply pagination
    query = query.order_by(MentorshipRequest.created_at.desc())
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    # Enrich with user details
    enriched_requests = []
    for req in requests:
        req_dict = {
            "id": req.id,
            "student_id": req.student_id,
            "alumni_id": req.alumni_id,
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "student_name": req.student.full_name if req.student else None,
            "alumni_name": req.alumni.full_name if req.alumni else None,
            "student_email": req.student.email if req.student else None,
            "student_department": req.student.profile.department if req.student and req.student.profile else None,
            "alumni_company": req.alumni.profile.current_company if req.alumni and req.alumni.profile else None,
            "alumni_position": req.alumni.profile.current_position if req.alumni and req.alumni.profile else None,
        }
        enriched_requests.append(MentorshipRequestWithDetails(**req_dict))
    
    return enriched_requests


@router.patch("/requests/{request_id}", response_model=MentorshipRequestResponse)
async def update_mentorship_request(
    request_id: uuid.UUID,
    update_data: MentorshipRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update mentorship request status (alumni only).
    
    Alumni can accept or reject incoming mentorship requests.
    """
    # Only alumni can update requests
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni can update mentorship requests"
        )
    
    # Get the request
    query = select(MentorshipRequest).where(
        MentorshipRequest.id == request_id,
        MentorshipRequest.alumni_id == current_user.id
    )
    result = await db.execute(query)
    mentorship_request = result.scalar_one_or_none()
    
    if not mentorship_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentorship request not found"
        )
    
    # Update status
    mentorship_request.status = update_data.status
    await db.commit()
    await db.refresh(mentorship_request)
    
    # Send WebSocket notification to student
    await connection_manager.send_to_user(
        user_id=mentorship_request.student_id,
        message={
            "type": "mentorship_response",
            "data": {
                "request_id": str(mentorship_request.id),
                "status": update_data.status.value,
                "alumni_name": current_user.full_name,
                "updated_at": mentorship_request.updated_at.isoformat()
            }
        }
    )
    
    return mentorship_request
