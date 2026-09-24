import apiClient from './api';

export interface CircleMember {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
    department?: string;
}

export interface CirclePost {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    created_at: string;
}

export interface CircleSession {
    id: string;
    title: string;
    description?: string;
    scheduled_at: string;
    meeting_link?: string;
}

export interface Circle {
    id: string;
    title: string;
    description: string;
    domain: string;
    owner_id: string;
    owner_name: string;
    owner_company?: string;
    owner_position?: string;
    owner_avatar?: string;
    capacity: number;
    current_members_count: number;
    schedule?: string;
    cover_image?: string;
    is_member: boolean;
    is_owner?: boolean;
    created_at: string;
    members?: CircleMember[];
    posts?: CirclePost[];
    sessions?: CircleSession[];
}

export interface CircleCreateData {
    title: string;
    description: string;
    domain: string;
    capacity?: number;
    schedule?: string;
    cover_image?: string;
}

export const circleService = {
    async getCircles(params?: { domain?: string; search?: string }): Promise<Circle[]> {
        const response = await apiClient.get('/circles', { params });
        return response.data;
    },

    async getCircleDetail(circleId: string): Promise<Circle> {
        const response = await apiClient.get(`/circles/${circleId}`);
        return response.data;
    },

    async createCircle(data: CircleCreateData): Promise<{ message: string; circle_id: string }> {
        const response = await apiClient.post('/circles/create', data);
        return response.data;
    },

    async joinCircle(circleId: string): Promise<{ message: string }> {
        const response = await apiClient.post(`/circles/${circleId}/join`);
        return response.data;
    },

    async addCirclePost(circleId: string, content: string): Promise<{ message: string }> {
        const response = await apiClient.post(`/circles/${circleId}/posts`, { content });
        return response.data;
    }
};
