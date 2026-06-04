import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import axios from 'axios';

interface HealthStatus {
    status: string;
    database: string;
    websocket_connections: number;
}

const Home = () => {
    const { user } = useAuth();
    const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
    const [testMessage, setTestMessage] = useState('');

    // WebSocket notifications (only connect if user is logged in)
    const { messages, isConnected, sendMessage, clearMessages } = useNotifications(
        user?.id || null,
        !!user
    );

    // Fetch health status on mount
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await axios.get<HealthStatus>('/api/health');
                setHealthStatus(response.data);
            } catch (error) {
                console.error('Failed to fetch health status:', error);
            }
        };

        fetchHealth();
    }, []);

    const handleSendMessage = () => {
        if (testMessage.trim()) {
            sendMessage(testMessage);
            setTestMessage('');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🎓 GradConnect</h1>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
                Alumni Management Platform - Phase 1 Skeleton
            </p>

            {/* Health Status */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <h2>🏥 System Health</h2>
                {healthStatus ? (
                    <div>
                        <p>✅ API Status: <strong>{healthStatus.status}</strong></p>
                        <p>🗄️ Database: <strong>{healthStatus.database}</strong></p>
                        <p>🔌 Active WebSocket Connections: <strong>{healthStatus.websocket_connections}</strong></p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            {/* User Info */}
            {user && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
                    <h2>👤 User Info</h2>
                    <p>Name: <strong>{user.full_name}</strong></p>
                    <p>Email: <strong>{user.email}</strong></p>
                    <p>Role: <strong>{user.role.toUpperCase()}</strong></p>
                    <p>ID: <code>{user.id}</code></p>
                </div>
            )}

            {/* WebSocket Demo */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3e0', borderRadius: '8px' }}>
                <h2>🔌 WebSocket Connection</h2>
                <p>
                    Status: {isConnected ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Connected</span>
                    ) : (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>❌ Disconnected</span>
                    )}
                </p>

                {user && isConnected && (
                    <div style={{ marginTop: '1rem' }}>
                        <input
                            type="text"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                        <button onClick={clearMessages} style={{ marginLeft: '0.5rem' }}>Clear</button>
                    </div>
                )}

                {/* Messages */}
                <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    <h3>Messages ({messages.length})</h3>
                    {messages.length === 0 ? (
                        <p style={{ color: '#999' }}>No messages yet...</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.5rem',
                                    margin: '0.5rem 0',
                                    background: '#fff',
                                    borderLeft: '3px solid #646cff',
                                    textAlign: 'left',
                                }}
                            >
                                <strong>{msg.type}:</strong> {msg.message}
                                {msg.timestamp && (
                                    <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '1rem' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Architecture Info */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', textAlign: 'left' }}>
                <h2>🏗️ Architecture</h2>
                <ul>
                    <li>✅ <strong>Backend:</strong> FastAPI with async/await</li>
                    <li>✅ <strong>Database:</strong> PostgreSQL 15 with asyncpg driver</li>
                    <li>✅ <strong>WebSocket:</strong> Real-time notifications with ConnectionManager</li>
                    <li>✅ <strong>Frontend:</strong> React 18 + TypeScript + Vite</li>
                    <li>✅ <strong>Infrastructure:</strong> Docker Compose orchestration</li>
                    <li>✅ <strong>User Roles:</strong> Admin, Alumni, Student (UUID-based)</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
