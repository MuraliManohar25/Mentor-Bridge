from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User, UserRole, Profile
from app.models.mentorship import MentorshipRequest, MentorshipStatus
from app.models.community import Circle
from app.core.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard & Recognition"])


@router.get("")
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Dynamically calculate alumni rankings based on real activity:
    - Accepted / Completed mentorships (students helped)
    - Active circles owned
    - Karma points earned
    """
    query = (
        select(User)
        .join(Profile, User.id == Profile.user_id)
        .where(User.role == UserRole.ALUMNI)
        .where(User.is_active == True)
        .options(
            joinedload(User.profile),
            selectinload(User.received_mentorship_requests)
        )
    )
    res = await db.execute(query)
    alumni_list = res.scalars().unique().all()

    # Get circle counts for each alumni
    circle_query = select(Circle.owner_id, func.count(Circle.id)).group_by(Circle.owner_id)
    circle_res = await db.execute(circle_query)
    circle_counts = dict(circle_res.all())

    leaderboard = []
    for user in alumni_list:
        p = user.profile
        # Count accepted mentorship requests
        accepted_requests = sum(
            1 for req in user.received_mentorship_requests
            if req.status in [MentorshipStatus.ACCEPTED, MentorshipStatus.COMPLETED]
        )
        owned_circles = circle_counts.get(user.id, 0)
        
        # Calculate impact score dynamically
        score = (accepted_requests * 50) + (owned_circles * 30) + (p.points if p else 0)

        # Dynamic badges
        badges = list(p.badges) if p and p.badges else []
        if accepted_requests >= 5 and "Top Mentor" not in badges:
            badges.append("Top Mentor")
        if owned_circles >= 1 and "Community Leader" not in badges:
            badges.append("Community Leader")
        if accepted_requests >= 10 and "Mentor of the Month" not in badges:
            badges.append("Mentor of the Month")

        leaderboard.append({
            "user_id": str(user.id),
            "full_name": user.full_name,
            "company": p.current_company if p else None,
            "position": p.current_position if p else None,
            "avatar_url": p.avatar_url if p else None,
            "students_helped": accepted_requests,
            "active_circles": owned_circles,
            "impact_score": score,
            "badges": badges,
            "department": p.department if p else None
        })

    # Sort descending by impact_score
    leaderboard.sort(key=lambda x: x["impact_score"], reverse=True)

    # Add calculated rank
    for idx, item in enumerate(leaderboard):
        item["rank"] = idx + 1

    return leaderboard


@router.get("/my-impact")
async def get_my_impact_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dynamic impact stats for the logged-in alumni user."""
    if current_user.role != UserRole.ALUMNI:
        return {
            "students_helped": 0,
            "active_circles": 0,
            "global_rank": None,
            "karma_points": 0
        }

    leaderboard_data = await get_leaderboard(db=db, current_user=current_user)
    my_data = next((item for item in leaderboard_data if item["user_id"] == str(current_user.id)), None)

    if not my_data:
        return {
            "students_helped": 0,
            "active_circles": 0,
            "global_rank": None,
            "karma_points": 0,
            "badges": []
        }

    return {
        "students_helped": my_data["students_helped"],
        "active_circles": my_data["active_circles"],
        "global_rank": my_data["rank"],
        "karma_points": my_data["impact_score"],
        "badges": my_data["badges"]
    }
