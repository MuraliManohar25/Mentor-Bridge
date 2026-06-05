import apiClient, { getErrorMessage } from './api';

export interface AdminStatsResponse {
    total_users: number;
    users_by_role: Record<string, number>;
    new_signups_30_days: number;
    active_mentorships: number;
    total_jobs_posted: number;
    users_by_department: Record<string, number>;
}

export interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    role: string;
    department: string | null;
    verification_status: string;
    is_active: boolean;
    created_at: string | null;
}

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
    try {
        const response = await apiClient.get<AdminStatsResponse>('/admin/stats');
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getAdminUsers = async (search?: string, verificationStatus?: string): Promise<AdminUser[]> => {
    try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (verificationStatus && verificationStatus !== 'all') params.verification_status = verificationStatus;
        const response = await apiClient.get<AdminUser[]>('/admin/users', { params });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const verifyUser = async (userId: string, status: 'verified' | 'rejected') => {
    const response = await apiClient.patch(`/admin/verify-user/${userId}`, { status });
    return response.data;
};

export const deactivateUser = async (userId: string, isActive: boolean) => {
    const response = await apiClient.patch(`/admin/deactivate-user/${userId}`, { is_active: isActive });
    return response.data;
};

export const deleteUser = async (userId: string) => {
    const response = await apiClient.delete(`/admin/delete-user/${userId}`);
    return response.data;
};
