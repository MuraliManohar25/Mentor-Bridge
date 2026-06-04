/**
 * Mentorship Service
 * 
 * API calls for mentorship request management
 */
import apiClient, { getErrorMessage } from './api';

export enum MentorshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
}

export interface MentorshipRequest {
    id: string;
    student_id: string;
    alumni_id: string;
    message: string;
    status: MentorshipStatus;
    created_at: string;
    updated_at: string;
    student_name?: string;
    alumni_name?: string;
    student_email?: string;
    student_department?: string;
    alumni_company?: string;
    alumni_position?: string;
}

export interface CreateMentorshipRequest {
    alumni_id: string;
    message: string;
}

export interface UpdateMentorshipRequest {
    status: MentorshipStatus;
}

/**
 * Send a mentorship request (students only)
 */
export const sendMentorshipRequest = async (
    data: CreateMentorshipRequest
): Promise<MentorshipRequest> => {
    try {
        const response = await apiClient.post<MentorshipRequest>('/mentorship/request', data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Get mentorship requests
 * - Alumni: incoming requests
 * - Students: sent requests
 */
export const getMentorshipRequests = async (
    statusFilter?: MentorshipStatus,
    limit: number = 20,
    offset: number = 0
): Promise<MentorshipRequest[]> => {
    try {
        const params: any = { limit, offset };
        if (statusFilter) {
            params.status = statusFilter;
        }

        const response = await apiClient.get<MentorshipRequest[]>('/mentorship/requests', { params });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Update mentorship request status (alumni only)
 */
export const updateRequestStatus = async (
    requestId: string,
    status: MentorshipStatus
): Promise<MentorshipRequest> => {
    try {
        const response = await apiClient.patch<MentorshipRequest>(
            `/mentorship/requests/${requestId}`,
            { status }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export default {
    sendMentorshipRequest,
    getMentorshipRequests,
    updateRequestStatus,
};
