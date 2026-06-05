import apiClient, { getErrorMessage } from './api';

export interface JobResponse {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    description: string;
    requirements: string[];
    apply_link: string;
    category: 'internal' | 'external' | 'overseas';
    country?: string;
    salary_range?: string;
    status: 'active' | 'closed';
    posted_by_id: string;
    posted_by_name?: string;
    created_at: string;
}

export interface CreateJobPayload {
    title: string;
    company: string;
    location: string;
    job_type: string;
    description: string;
    requirements: string[];
    apply_link: string;
}

export interface CreateOverseasJobPayload {
    title: string;
    company: string;
    country: string;
    description: string;
    requirements: string[];
    salary_range?: string;
    status?: 'active' | 'closed';
}

export const getJobs = async (category?: string): Promise<JobResponse[]> => {
    try {
        const params = category ? { category } : undefined;
        const response = await apiClient.get<JobResponse[]>('/jobs', { params });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getMyJobs = async (): Promise<JobResponse[]> => {
    try {
        const response = await apiClient.get<JobResponse[]>('/jobs/my-jobs');
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getOverseasJobs = async (): Promise<JobResponse[]> => {
    try {
        const response = await apiClient.get<JobResponse[]>('/jobs/overseas');
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createJob = async (payload: CreateJobPayload): Promise<JobResponse> => {
    try {
        const response = await apiClient.post<JobResponse>('/jobs', payload);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createOverseasJob = async (payload: CreateOverseasJobPayload): Promise<JobResponse> => {
    try {
        const response = await apiClient.post<JobResponse>('/jobs/overseas', payload);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateJobStatus = async (jobId: string, status: 'active' | 'closed'): Promise<JobResponse> => {
    try {
        const response = await apiClient.patch<JobResponse>(`/jobs/${jobId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
