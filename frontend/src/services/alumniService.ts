import apiClient, { getErrorMessage } from './api';

export interface Alumni {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department?: string;
    profile?: {
        bio?: string;
        avatar_url?: string;
        graduation_year?: number;
        department?: string;
        current_company?: string;
        current_position?: string;
        location?: string;
        linkedin_url?: string;
        availability?: string;
        is_mentor: boolean;
        mentorship_expertise?: string[];
    };
}

export interface AlumniSearchParams {
    search?: string;
    department?: string;
    is_mentor?: boolean;
    expertise?: string;
    limit?: number;
    offset?: number;
}

export interface AlumniSearchResponse {
    total: number;
    limit: number;
    offset: number;
    results: Alumni[];
}

export const getAlumni = async (params: AlumniSearchParams = {}): Promise<AlumniSearchResponse> => {
    try {
        const response = await apiClient.get<AlumniSearchResponse>('/alumni', { params });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getAlumniProfile = async (id: string): Promise<Alumni> => {
    try {
        const response = await apiClient.get<Alumni>(`/alumni/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateMentorStatus = async (isMentor: boolean): Promise<{ is_mentor: boolean; message: string }> => {
    try {
        const response = await apiClient.patch('/alumni/mentor-status', {
            is_mentor: isMentor,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const alumniService = {
    getAlumni,
    getAlumniProfile,
    updateMentorStatus,
};

export default alumniService;
