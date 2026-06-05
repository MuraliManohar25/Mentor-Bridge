from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.job import Job, JobCategory, JobStatus, JobType
from app.schemas.job import JobCreate, JobOut, JobStatusUpdate, OverseasJobCreate
from app.core.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _job_to_out(job: Job) -> JobOut:
    return JobOut(
        id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        job_type=job.job_type,
        description=job.description,
        requirements=job.requirements or [],
        apply_link=job.apply_link,
        category=job.category,
        country=job.country,
        salary_range=job.salary_range,
        status=job.status,
        posted_by_id=job.posted_by_id,
        posted_by_name=job.posted_by.full_name if job.posted_by else None,
        created_at=job.created_at,
    )


@router.get("", response_model=List[JobOut])
async def list_jobs(
    category: Optional[JobCategory] = Query(None),
    status_filter: Optional[JobStatus] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    """List active jobs for students and alumni."""
    query = select(Job).options(joinedload(Job.posted_by))

    if status_filter:
        query = query.where(Job.status == status_filter)
    else:
        query = query.where(Job.status == JobStatus.ACTIVE)

    if category:
        query = query.where(Job.category == category)
    else:
        query = query.where(Job.category.in_([JobCategory.INTERNAL, JobCategory.EXTERNAL]))

    query = query.order_by(Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().unique().all()
    return [_job_to_out(job) for job in jobs]


@router.get("/my-jobs", response_model=List[JobOut])
async def list_my_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List jobs posted by the current alumni user."""
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(status_code=403, detail="Only alumni can view their job posts")

    result = await db.execute(
        select(Job)
        .options(joinedload(Job.posted_by))
        .where(Job.posted_by_id == current_user.id)
        .order_by(Job.created_at.desc())
    )
    jobs = result.scalars().unique().all()
    return [_job_to_out(job) for job in jobs]


@router.get("/overseas", response_model=List[JobOut])
async def list_overseas_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List overseas jobs (admin-managed)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.execute(
        select(Job)
        .options(joinedload(Job.posted_by))
        .where(Job.category == JobCategory.OVERSEAS)
        .order_by(Job.created_at.desc())
    )
    jobs = result.scalars().unique().all()
    return [_job_to_out(job) for job in jobs]


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alumni post an internal job listing."""
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(status_code=403, detail="Only alumni can post jobs")

    job = Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        job_type=job_data.job_type,
        description=job_data.description,
        requirements=job_data.requirements,
        apply_link=job_data.apply_link,
        category=JobCategory.INTERNAL,
        posted_by_id=current_user.id,
        status=JobStatus.ACTIVE,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    result = await db.execute(
        select(Job).options(joinedload(Job.posted_by)).where(Job.id == job.id)
    )
    created = result.scalar_one()
    return _job_to_out(created)


@router.post("/overseas", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_overseas_job(
    job_data: OverseasJobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin posts an official overseas job."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    job = Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.country,
        country=job_data.country,
        job_type=JobType.FULL_TIME,
        description=job_data.description,
        requirements=job_data.requirements,
        apply_link="https://careers.example.com",
        category=JobCategory.OVERSEAS,
        salary_range=job_data.salary_range,
        posted_by_id=current_user.id,
        status=job_data.status,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    result = await db.execute(
        select(Job).options(joinedload(Job.posted_by)).where(Job.id == job.id)
    )
    created = result.scalar_one()
    return _job_to_out(created)


@router.patch("/{job_id}/status", response_model=JobOut)
async def update_job_status(
    job_id: uuid.UUID,
    update: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle job active/closed status."""
    result = await db.execute(
        select(Job).options(joinedload(Job.posted_by)).where(Job.id == job_id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role == UserRole.ALUMNI and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    if current_user.role not in (UserRole.ALUMNI, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    job.status = update.status
    await db.commit()
    await db.refresh(job)
    return _job_to_out(job)
