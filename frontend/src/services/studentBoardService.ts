import apiClient from './api';

export interface StudentBoardResponse {
    id: string;
    alumni_id: string;
    alumni_name: string;
    alumni_company?: string;
    alumni_avatar?: string;
    content: string;
    created_at: string;
}

export interface StudentBoardPost {
    id: string;
    student_id: string;
    student_name: string;
    student_department?: string;
    student_avatar?: string;
    title: string;
    content: string;
    domain: string;
    status: string;
    created_at: string;
    responses_count: number;
    responses: StudentBoardResponse[];
}

export interface StudentBoardCreateData {
    title: string;
    content: string;
    domain?: string;
}

export const studentBoardService = {
    async getPosts(domain?: string): Promise<StudentBoardPost[]> {
        const response = await apiClient.get('/student-board', { params: { domain } });
        return response.data;
    },

    async createPost(data: StudentBoardCreateData): Promise<{ message: string; id: string }> {
        const response = await apiClient.post('/student-board/create', data);
        return response.data;
    },

    async respondToPost(postId: string, content: string): Promise<{ message: string }> {
        const response = await apiClient.post(`/student-board/${postId}/respond`, { content });
        return response.data;
    }
};
