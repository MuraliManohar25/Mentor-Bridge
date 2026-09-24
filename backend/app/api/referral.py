from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import secrets
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.models.user import User, Profile
from app.models.referral import Referral
from app.core.auth import get_current_user

router = APIRouter(prefix="/referrals", tags=["Referrals"])


class InviteRequest(BaseModel):
    email: EmailStr


@router.get("/my-link")
async def get_referral_link(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Profile).where(Profile.user_id == current_user.id)
    res = await db.execute(query)
    profile = res.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if not profile.referral_code:
        code_base = current_user.full_name.lower().replace(" ", "")[:10]
        random_suffix = secrets.token_hex(3)
        profile.referral_code = f"{code_base}-{random_suffix}"
        await db.commit()

    referral_url = f"http://localhost:5173/register?ref={profile.referral_code}"

    # Get referral stats
    ref_query = select(Referral).where(Referral.inviter_id == current_user.id)
    ref_res = await db.execute(ref_query)
    referrals = ref_res.scalars().all()

    joined_count = sum(1 for r in referrals if r.status == "joined")

    return {
        "referral_code": profile.referral_code,
        "referral_url": referral_url,
        "total_invites": len(referrals),
        "successful_joins": joined_count,
        "points_earned": profile.points
    }


@router.post("/invite")
async def send_invite(
    data: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Profile).where(Profile.user_id == current_user.id)
    res = await db.execute(query)
    profile = res.scalar_one_or_none()

    if not profile or not profile.referral_code:
        code_base = current_user.full_name.lower().replace(" ", "")[:10]
        random_suffix = secrets.token_hex(3)
        code = f"{code_base}-{random_suffix}"
        if profile:
            profile.referral_code = code
    else:
        code = profile.referral_code

    referral = Referral(
        inviter_id=current_user.id,
        code=code,
        invitee_email=data.email,
        status="pending"
    )
    db.add(referral)
    await db.commit()

    return {"message": f"Invitation sent to {data.email}"}
