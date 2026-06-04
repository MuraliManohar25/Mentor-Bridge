from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import joinedload
from typing import Optional

from app.db.session import get_db
from app.models.user import User, UserRole, Profile
from app.schemas.user import AlumniPublicOut, AlumniSearchResponse, MentorStatusUpdate
from app.core.auth import get_current_user

router = APIRouter(prefix="/alumni", tags=["Alumni Discovery"])


@router.get("", response_model=AlumniSearchResponse)
async def search_alumni(
    search: Optional[str] = Query(None, description="Search across name, company, and bio"),
    department: Optional[str] = Query(None, description="Filter by department"),
    is_mentor: Optional[bool] = Query(None, description="Filter by mentor availability"),
    expertise: Optional[str] = Query(None, description="Filter by specific expertise"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search and discover alumni with advanced filtering.
    
    Features:
    - Multi-field search (name, company, bio)
    - Filter by department, mentor status, expertise
    - Pagination support
    - Optimized with joinedload to avoid N+1 queries
    
    Query Parameters:
        search: Search string for name, company, or bio (case-insensitive)
        department: Exact match on department
        is_mentor: Filter only mentors (true) or non-mentors (false)
        expertise: Search for specific skill in mentorship_expertise array
        limit: Results per page (default 20, max 100)
        offset: Number of results to skip for pagination
        
    Returns:
        AlumniSearchResponse with total count and paginated results
    """
    # Base query: Alumni role, active users, with profile loaded
    query = (
        select(User)
        .options(joinedload(User.profile))
        .where(User.role == UserRole.ALUMNI)
        .where(User.is_active == True)
    )
    
    # Search across multiple fields (case-insensitive)
    if search:
        search_pattern = f"%{search}%"
        search_filter = or_(
            User.full_name.ilike(search_pattern),
            Profile.current_company.ilike(search_pattern),
            Profile.bio.ilike(search_pattern)
        )
        query = query.where(search_filter)
    
    # Filter by department (exact match)
    if department:
        query = query.where(Profile.department == department)
    
    # Filter by mentor availability
    if is_mentor is not None:
        query = query.where(Profile.is_mentor == is_mentor)
    
    # Filter by expertise (JSON array contains)
    if expertise:
        # PostgreSQL JSON contains operator
        query = query.where(Profile.mentorship_expertise.contains([expertise]))
    
    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    query = query.limit(limit).offset(offset)
    
    # Execute query
    result = await db.execute(query)
    alumni = result.scalars().all()
    
    # Convert to response schema
    return AlumniSearchResponse(
        total=total,
        limit=limit,
        offset=offset,
        results=[AlumniPublicOut.model_validate(alumnus) for alumnus in alumni]
    )


@router.patch("/mentor-status", response_model=dict)
async def update_mentor_status(
    status_update: MentorStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle mentor availability status for the current user.
    
    Only alumni can update their mentor status.
    Students and admins cannot become mentors.
    
    Args:
        status_update: New mentor status (true/false)
        current_user: Authenticated user from JWT
        db: Database session
        
    Returns:
        Success message with updated status
        
    Raises:
        HTTPException 403: If user is not alumni role
        HTTPException 404: If profile not found
    """
    # Verify user is alumni
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni can update mentor status"
        )
    
    # Load user's profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update mentor status
    profile.is_mentor = status_update.is_mentor
    await db.commit()
    await db.refresh(profile)
    
    return {
        "is_mentor": profile.is_mentor,
        "message": f"Mentor status {'enabled' if profile.is_mentor else 'disabled'} successfully"
    }
