import { useState, useEffect, useCallback, useRef } from 'react';

interface NotificationMessage {
    type: string;
    message: string;
    timestamp?: string;
    [key: string]: any;
}

interface UseNotificationsReturn {
    messages: NotificationMessage[];
    isConnected: boolean;
    sendMessage: (message: string) => void;
    clearMessages: () => void;
    connectionError: string | null;
}

/**
 * Custom hook for WebSocket-based real-time notifications.
 * 
 * Features:
 * - Auto-reconnect on connection loss
 * - Message queue management
 * - Connection state tracking
 * 
 * @param userId - UUID of the user to connect as
 * @param enabled - Whether to establish the connection (default: true)
 * @returns Notification state and control functions
 * 
 * @example
 * const { messages, isConnected, sendMessage } = useNotifications(user.id);
 */
export const useNotifications = (
    userId: string | null,
    enabled: boolean = true
): UseNotificationsReturn => {
    const [messages, setMessages] = useState<NotificationMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!userId || !enabled) return;

        try {
            // Determine WebSocket URL based on environment
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = import.meta.env.VITE_WS_URL || window.location.host;
            const wsUrl = `${protocol}//${host}/api/ws/${userId}`;

            console.log('Connecting to WebSocket:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setConnectionError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, { ...data, timestamp: new Date().toISOString() }]);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionError('Connection error occurred');
            };

            ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                setIsConnected(false);
                wsRef.current = null;

                // Auto-reconnect after 3 seconds
                if (enabled) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('🔄 Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setConnectionError('Failed to establish connection');
        }
    }, [userId, enabled]);

    const sendMessage = useCallback((message: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(message);
        } else {
            console.warn('WebSocket is not connected');
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Connect on mount and when userId changes
    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return {
        messages,
        isConnected,
        sendMessage,
        clearMessages,
        connectionError,
    };
};
