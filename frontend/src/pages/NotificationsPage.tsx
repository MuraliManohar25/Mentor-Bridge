import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { notificationService, NotificationItem } from '../services/notificationService';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAll = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Error marking read", err);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-4xl mx-auto flex flex-col gap-md">
                <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]">notifications</span>
                            Notifications Inbox
                        </h1>
                        <p className="text-sm text-on-surface-variant">Stay updated on mentorship requests, answers, and messages.</p>
                    </div>

                    <button
                        onClick={handleMarkAll}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Mark All as Read
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-sm">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse"></div>)}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-xl text-center flex flex-col items-center justify-center gap-sm border border-dashed border-surface-container-high py-16">
                        <span className="material-symbols-outlined text-outline text-[48px]">notifications_off</span>
                        <h3 className="text-lg font-bold text-on-surface">You're all caught up!</h3>
                        <p className="text-sm text-on-surface-variant">No unread notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-sm">
                        {notifications.map((n) => (
                            <Link
                                key={n.id}
                                to={n.link_url || '#'}
                                className={`p-md rounded-xl border transition-all flex items-start justify-between gap-md ${
                                    n.is_read
                                        ? 'bg-surface-container-lowest border-surface-container-high/40 opacity-85'
                                        : 'bg-surface-container-low border-primary/20 shadow-xs'
                                }`}
                            >
                                <div className="flex items-start gap-md">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm text-on-surface">{n.title}</span>
                                        <p className="text-xs text-on-surface-variant">{n.message}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-outline shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default NotificationsPage;
