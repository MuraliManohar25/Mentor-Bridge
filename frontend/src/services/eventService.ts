import apiClient, { getErrorMessage } from './api';

export interface EventResponse {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    event_time: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected';
    organizer_id: string;
    organizer_name?: string;
    attendees: number;
    is_rsvped: boolean;
    created_at: string;
}

export interface CreateEventPayload {
    title: string;
    description?: string;
    event_date: string;
    event_time: string;
    location: string;
}

export const getEvents = async (includePending = false): Promise<EventResponse[]> => {
    try {
        const response = await apiClient.get<EventResponse[]>('/events', {
            params: includePending ? { include_pending: true } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createEvent = async (payload: CreateEventPayload): Promise<EventResponse> => {
    try {
        const response = await apiClient.post<EventResponse>('/events', payload);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
        const response = await apiClient.patch(`/events/${eventId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const toggleEventRsvp = async (eventId: string): Promise<EventResponse> => {
    try {
        const response = await apiClient.post<EventResponse>(`/events/${eventId}/rsvp`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
