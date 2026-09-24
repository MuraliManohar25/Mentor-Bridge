from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User
from app.models.messaging import Conversation, ConversationMember, Message
from app.core.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["Direct Messaging"])


class SendMessageRequest(BaseModel):
    recipient_id: Optional[uuid.UUID] = None
    conversation_id: Optional[uuid.UUID] = None
    content: str = Field(..., min_length=1)


@router.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find conversations where current user is a member
    query = (
        select(ConversationMember)
        .where(ConversationMember.user_id == current_user.id)
        .options(
            joinedload(ConversationMember.conversation)
            .selectinload(Conversation.members)
            .joinedload(ConversationMember.user)
            .joinedload(User.profile),
            joinedload(ConversationMember.conversation)
            .selectinload(Conversation.messages)
        )
    )
    result = await db.execute(query)
    memberships = result.scalars().all()

    conversations_out = []
    for m in memberships:
        c = m.conversation
        if not c:
            continue
        other_members = [mem for mem in c.members if mem.user_id != current_user.id]
        other_user = other_members[0].user if other_members else None

        last_msg = c.messages[-1] if c.messages else None
        unread_count = sum(1 for msg in c.messages if not msg.is_read and msg.sender_id != current_user.id)

        conversations_out.append({
            "id": str(c.id),
            "other_user_id": str(other_user.id) if other_user else None,
            "other_user_name": other_user.full_name if other_user else "User",
            "other_user_role": other_user.role.value if other_user else "student",
            "other_user_avatar": other_user.profile.avatar_url if other_user and other_user.profile else None,
            "other_user_company": other_user.profile.current_company if other_user and other_user.profile else None,
            "last_message": last_msg.content if last_msg else "No messages yet",
            "last_message_at": last_msg.created_at.isoformat() if last_msg else c.created_at.isoformat(),
            "unread_count": unread_count
        })

    conversations_out.sort(key=lambda x: x["last_message_at"], reverse=True)
    return conversations_out


@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Conversation).where(Conversation.id == conversation_id).options(
        selectinload(Conversation.members).joinedload(ConversationMember.user).joinedload(User.profile),
        selectinload(Conversation.messages).joinedload(Message.sender).joinedload(User.profile)
    )
    result = await db.execute(query)
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    is_participant = any(m.user_id == current_user.id for m in c.members)
    if not is_participant:
        raise HTTPException(status_code=403, detail="Access denied")

    # Mark unread messages as read
    for msg in c.messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
    await db.commit()

    other_members = [m for m in c.members if m.user_id != current_user.id]
    other_user = other_members[0].user if other_members else None

    return {
        "id": str(c.id),
        "other_user_id": str(other_user.id) if other_user else None,
        "other_user_name": other_user.full_name if other_user else "User",
        "other_user_avatar": other_user.profile.avatar_url if other_user and other_user.profile else None,
        "other_user_company": other_user.profile.current_company if other_user and other_user.profile else None,
        "messages": [
            {
                "id": str(msg.id),
                "sender_id": str(msg.sender_id),
                "sender_name": msg.sender.full_name,
                "sender_avatar": msg.sender.profile.avatar_url if msg.sender.profile else None,
                "content": msg.content,
                "is_me": msg.sender_id == current_user.id,
                "created_at": msg.created_at.isoformat()
            }
            for msg in sorted(c.messages, key=lambda x: x.created_at)
        ]
    }


@router.post("/send")
async def send_message(
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_conv_id = data.conversation_id

    # If conversation_id is not provided, locate or create a 1-to-1 conversation with recipient_id
    if not target_conv_id:
        if not data.recipient_id:
            raise HTTPException(status_code=400, detail="Must provide either conversation_id or recipient_id")

        # Search existing conversation between current_user and recipient_id
        q = (
            select(ConversationMember.conversation_id)
            .where(ConversationMember.user_id.in_([current_user.id, data.recipient_id]))
            .group_by(ConversationMember.conversation_id)
            .having(func.count(ConversationMember.user_id) == 2)
        )
        res = await db.execute(q)
        existing_id = res.scalar_one_or_none()

        if existing_id:
            target_conv_id = existing_id
        else:
            new_conv = Conversation()
            db.add(new_conv)
            await db.flush()
            db.add(ConversationMember(conversation_id=new_conv.id, user_id=current_user.id))
            db.add(ConversationMember(conversation_id=new_conv.id, user_id=data.recipient_id))
            target_conv_id = new_conv.id

    message = Message(
        conversation_id=target_conv_id,
        sender_id=current_user.id,
        content=data.content
    )
    db.add(message)
    await db.commit()

    return {"message": "Message sent successfully", "conversation_id": str(target_conv_id)}
