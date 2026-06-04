from fastapi import WebSocket
from typing import Dict, List
from uuid import UUID
import json


class ConnectionManager:
    """
    Async WebSocket connection manager for real-time notifications.
    
    Manages user-specific WebSocket connections using a Dict[UUID, List[WebSocket]]
    structure to support multiple simultaneous connections per user (e.g., multiple
    devices or browser tabs).
    
    Features:
    - User-specific message broadcasting
    - Multiple connections per user support
    - Automatic connection cleanup
    - System-wide announcements
    """
    
    def __init__(self):
        # Store active connections: user_id -> list of WebSocket connections
        self.active_connections: Dict[UUID, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: UUID) -> None:
        """
        Accept and register a new WebSocket connection for a user.
        
        Args:
            websocket: The WebSocket connection to register
            user_id: UUID of the user connecting
        """
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        print(f"✅ User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: UUID) -> None:
        """
        Remove a WebSocket connection for a user.
        
        Args:
            websocket: The WebSocket connection to remove
            user_id: UUID of the user disconnecting
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            # Clean up empty connection lists
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            print(f"❌ User {user_id} disconnected")
    
    async def send_personal_message(self, message: dict, user_id: UUID) -> None:
        """
        Send a message to all connections of a specific user.
        
        Args:
            message: Dictionary to send as JSON
            user_id: UUID of the target user
        """
        if user_id in self.active_connections:
            # Send to all active connections for this user
            disconnected = []
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error sending to {user_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up failed connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
    
    async def broadcast(self, message: dict) -> None:
        """
        Broadcast a message to all connected users.
        
        Args:
            message: Dictionary to send as JSON to all users
        """
        disconnected = []
        
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error broadcasting to {user_id}: {e}")
                    disconnected.append((connection, user_id))
        
        # Clean up failed connections
        for conn, user_id in disconnected:
            self.disconnect(conn, user_id)
    
    def get_user_connection_count(self, user_id: UUID) -> int:
        """Get the number of active connections for a user."""
        return len(self.active_connections.get(user_id, []))
    
    def get_total_connections(self) -> int:
        """Get the total number of active connections across all users."""
        return sum(len(connections) for connections in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()
connection_manager = manager  # Alias for backwards compatibility
