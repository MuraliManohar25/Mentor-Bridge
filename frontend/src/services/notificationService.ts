import apiClient from './api';

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    link_url?: string;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    async getNotifications(): Promise<NotificationItem[]> {
        const response = await apiClient.get('/notifications');
        return response.data;
    },

    async markAsRead(notificationId: string): Promise<{ message: string }> {
        const response = await apiClient.post(`/notifications/${notificationId}/read`);
        return response.data;
    },

    async markAllAsRead(): Promise<{ message: string }> {
        const response = await apiClient.post('/notifications/read-all');
        return response.data;
    }
};
