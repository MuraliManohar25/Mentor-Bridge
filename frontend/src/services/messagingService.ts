import apiClient from './api';

export interface MessageItem {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar?: string;
    content: string;
    is_me: boolean;
    created_at: string;
}

export interface ConversationItem {
    id: string;
    other_user_id?: string;
    other_user_name: string;
    other_user_role: string;
    other_user_avatar?: string;
    other_user_company?: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

export interface ConversationDetail {
    id: string;
    other_user_id?: string;
    other_user_name: string;
    other_user_avatar?: string;
    other_user_company?: string;
    messages: MessageItem[];
}

export const messagingService = {
    async getConversations(): Promise<ConversationItem[]> {
        const response = await apiClient.get('/messages/conversations');
        return response.data;
    },

    async getConversationMessages(conversationId: string): Promise<ConversationDetail> {
        const response = await apiClient.get(`/messages/conversations/${conversationId}`);
        return response.data;
    },

    async sendMessage(data: { conversation_id?: string; recipient_id?: string; content: string }): Promise<{ message: string; conversation_id: string }> {
        const response = await apiClient.post('/messages/send', data);
        return response.data;
    }
};
