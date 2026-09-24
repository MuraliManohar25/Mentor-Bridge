import apiClient from './api';

export interface PostComment {
    id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    content: string;
    created_at: string;
}

export interface Post {
    id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    author_company?: string;
    author_position?: string;
    author_avatar?: string;
    content: string;
    media_url?: string;
    post_type: string;
    likes_count: number;
    comments_count: number;
    has_liked: boolean;
    created_at: string;
    comments: PostComment[];
}

export interface PostCreateData {
    content: string;
    media_url?: string;
    post_type?: string;
    visibility?: string;
}

export const feedService = {
    async getPosts(params?: { post_type?: string; limit?: number; offset?: number }): Promise<Post[]> {
        const response = await apiClient.get('/posts', { params });
        return response.data;
    },

    async getPostDetail(postId: string): Promise<Post> {
        const response = await apiClient.get(`/posts/${postId}`);
        return response.data;
    },

    async createPost(data: PostCreateData): Promise<{ message: string; id: string }> {
        const response = await apiClient.post('/posts/create', data);
        return response.data;
    },

    async toggleLike(postId: string): Promise<{ liked: boolean; message: string }> {
        const response = await apiClient.post(`/posts/${postId}/react`);
        return response.data;
    },

    async addComment(postId: string, content: string): Promise<{ message: string }> {
        const response = await apiClient.post(`/posts/${postId}/comments`, { content });
        return response.data;
    }
};
