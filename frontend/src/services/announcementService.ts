import apiClient, { getErrorMessage } from './api';

export interface AnnouncementResponse {
    id: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    created_by_id: string;
    created_by_name?: string;
    created_at: string;
}

export interface CreateAnnouncementPayload {
    title: string;
    content: string;
    priority?: 'high' | 'medium' | 'low';
    type?: 'info' | 'warning' | 'success';
}

export const getAnnouncements = async (): Promise<AnnouncementResponse[]> => {
    try {
        const response = await apiClient.get<AnnouncementResponse[]>('/announcements');
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createAnnouncement = async (payload: CreateAnnouncementPayload): Promise<AnnouncementResponse> => {
    try {
        const response = await apiClient.post<AnnouncementResponse>('/announcements', payload);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
