from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.websockets.manager import manager
from app.db.session import get_db
from uuid import UUID
import uuid

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint to verify API and database connectivity.
    
    Returns:
        dict: Status of the application and database connection
    """
    try:
        # Test database connection
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "websocket_connections": manager.get_total_connections()
    }


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time notifications.
    
    Args:
        websocket: WebSocket connection
        user_id: UUID string of the connecting user
    
    Example client usage:
        const ws = new WebSocket('ws://localhost:8000/api/ws/123e4567-e89b-12d3-a456-426614174000');
        ws.onmessage = (event) => console.log(JSON.parse(event.data));
    """
    try:
        # Convert string to UUID
        user_uuid = UUID(user_id)
    except ValueError:
        await websocket.close(code=1003, reason="Invalid user ID format")
        return
    
    # Connect the user
    await manager.connect(websocket, user_uuid)
    
    try:
        # Send welcome message
        await manager.send_personal_message(
            {
                "type": "connection",
                "message": f"Welcome! You are connected as user {user_id}",
                "connections": manager.get_user_connection_count(user_uuid)
            },
            user_uuid
        )
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            
            # Echo back the message (demo functionality)
            await manager.send_personal_message(
                {
                    "type": "echo",
                    "message": f"You sent: {data}",
                    "user_id": str(user_uuid)
                },
                user_uuid
            )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_uuid)
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_uuid)


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "GradConnect API",
        "version": "1.0.0",
        "docs": "/docs"
    }
