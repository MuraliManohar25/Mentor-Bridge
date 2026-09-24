from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
import uuid
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.models.user import User, Profile, UserRole
from app.schemas.user import UserWithProfile, ProfileUpdate
from app.core.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


class StudentSetupRequest(BaseModel):
    avatar_url: str = None
    full_name: str = None
    department: str = None
    graduation_year: int = None
    bio: str = None
    interests: list[str] = []
    career_interests: list[str] = []


class AlumniSetupRequest(BaseModel):
    avatar_url: str = None
    full_name: str = None
    current_company: str = None
    current_position: str = None
    graduation_year: int = None
    department: str = None
    bio: str = None
    location: str = None
    linkedin_url: str = None
    availability: str = "Available"
    mentorship_expertise: list[str] = []


@router.post("/setup/student")
async def setup_student_profile(
    data: StudentSetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.department:
        current_user.department = data.department

    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if data.avatar_url is not None:
        profile.avatar_url = data.avatar_url
    if data.graduation_year is not None:
        profile.graduation_year = data.graduation_year
    if data.department is not None:
        profile.department = data.department
    if data.bio is not None:
        profile.bio = data.bio
    if data.interests:
        profile.interests = data.interests
    if data.career_interests:
        profile.career_interests = data.career_interests

    await db.commit()
    return {"message": "Student profile setup complete"}


@router.post("/setup/alumni")
async def setup_alumni_profile(
    data: AlumniSetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.department:
        current_user.department = data.department

    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.is_mentor = True
    if data.avatar_url is not None:
        profile.avatar_url = data.avatar_url
    if data.current_company is not None:
        profile.current_company = data.current_company
    if data.current_position is not None:
        profile.current_position = data.current_position
    if data.graduation_year is not None:
        profile.graduation_year = data.graduation_year
    if data.department is not None:
        profile.department = data.department
    if data.bio is not None:
        profile.bio = data.bio
    if data.location is not None:
        profile.location = data.location
    if data.linkedin_url is not None:
        profile.linkedin_url = data.linkedin_url
    if data.availability is not None:
        profile.availability = data.availability
    if data.mentorship_expertise:
        profile.mentorship_expertise = data.mentorship_expertise

    await db.commit()
    return {"message": "Alumni mentor profile setup complete"}


@router.put("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.phone:
        current_user.phone = data.phone

    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    for field, val in data.model_dump(exclude_unset=True).items():
        if field in ["full_name", "phone"]:
            continue
        if hasattr(profile, field) and val is not None:
            setattr(profile, field, val)

    await db.commit()
    return {"message": "Profile updated successfully"}
