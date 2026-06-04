from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.user import User
from app.models.mentorship import MentorshipRequest
from app.core.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


class AdminStats(BaseModel):
    total_users: int
    users_by_role: dict
    new_signups_30_days: int
    active_mentorships: int
    total_jobs_posted: int
    users_by_department: dict


class UserVerification(BaseModel):
    status: str  # "verified", "rejected", "pending"


class UserDeactivation(BaseModel):
    is_active: bool


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive admin statistics for the dashboard.
    Requires admin role.
    """
    # Verify admin access
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total users count
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0
    
    # Users by role
    role_counts = await db.execute(
        select(User.role, func.count(User.id))
        .group_by(User.role)
    )
    users_by_role = {row[0]: row[1] for row in role_counts.all()}
    
    # New signups in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_signups_result = await db.execute(
        select(func.count(User.id))
        .where(User.created_at >= thirty_days_ago)
    )
    new_signups_30_days = new_signups_result.scalar() or 0
    
    # Active mentorships (accepted status)
    active_mentorships_result = await db.execute(
        select(func.count(MentorshipRequest.id))
        .where(MentorshipRequest.status == "accepted")
    )
    active_mentorships = active_mentorships_result.scalar() or 0
    
    # Total jobs posted (this would need a Jobs table in production)
    # For demo, returning 0
    total_jobs_posted = 0
    
    # Users by department (from profiles)
    dept_counts = await db.execute(
        select(User.department, func.count(User.id))
        .where(User.department.isnot(None))
        .group_by(User.department)
    )
    users_by_department = {row[0]: row[1] for row in dept_counts.all()}
    
    return AdminStats(
        total_users=total_users,
        users_by_role=users_by_role,
        new_signups_30_days=new_signups_30_days,
        active_mentorships=active_mentorships,
        total_jobs_posted=total_jobs_posted,
        users_by_department=users_by_department
    )


@router.get("/users")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = None,
    verification_status: Optional[str] = None
):
    """
    Get all users with optional filtering.
    Requires admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = select(User)
    
    # Apply search filter
    if search:
        query = query.where(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%")
            )
        )
    
    # Apply verification status filter
    if verification_status:
        query = query.where(User.verification_status == verification_status)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "verification_status": user.verification_status,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in users
    ]


@router.patch("/verify-user/{user_id}")
async def verify_user(
    user_id: str,
    verification: UserVerification,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify or reject a user.
    Requires admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update verification status
    user.verification_status = verification.status
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": f"User {verification.status}",
        "user_id": str(user.id),
        "verification_status": user.verification_status
    }


@router.patch("/deactivate-user/{user_id}")
async def deactivate_user(
    user_id: str,
    deactivation: UserDeactivation,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Activate or deactivate a user.
    Requires admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update active status
    user.is_active = deactivation.is_active
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": f"User {'activated' if deactivation.is_active else 'deactivated'}",
        "user_id": str(user.id),
        "is_active": user.is_active
    }


@router.delete("/delete-user/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently delete a user.
    Requires admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user
    await db.delete(user)
    await db.commit()
    
    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }
