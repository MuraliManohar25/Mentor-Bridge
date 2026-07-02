/**
 * Meeting Service
 * 
 * API calls for meeting management
 */
import apiClient, { getErrorMessage } from './api';

export enum MeetingStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Meeting {
  id: string;
  student_id: string;
  alumni_id: string;
  mentorship_request_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  student_name?: string;
  alumni_name?: string;
  student_email?: string;
  student_department?: string;
  alumni_company?: string;
  alumni_position?: string;
}

export interface CreateMeeting {
  student_id: string;
  alumni_id: string;
  mentorship_request_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
}

export interface UpdateMeeting {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  meeting_link?: string;
  status?: MeetingStatus;
}

/**
 * Create a new meeting
 */
export const createMeeting = async (
  data: CreateMeeting
): Promise<Meeting> => {
  try {
    const response = await apiClient.post<Meeting>('/meetings', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get meetings for the current user
 */
export const getMeetings = async (
  statusFilter?: MeetingStatus,
  limit: number = 20,
  offset: number = 0
): Promise<Meeting[]> => {
  try {
    const params: any = { limit, offset };
    if (statusFilter) {
      params.status = statusFilter;
    }

    const response = await apiClient.get<Meeting[]>('/meetings', { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get a specific meeting by ID
 */
export const getMeeting = async (meetingId: string): Promise<Meeting> => {
  try {
    const response = await apiClient.get<Meeting>(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update a meeting
 */
export const updateMeeting = async (
  meetingId: string,
  data: UpdateMeeting
): Promise<Meeting> => {
  try {
    const response = await apiClient.patch<Meeting>(
      `/meetings/${meetingId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete a meeting
 */
export const deleteMeeting = async (meetingId: string): Promise<void> => {
  try {
    await apiClient.delete(`/meetings/${meetingId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
};
