import apiClient from './api';

export interface ReferralLinkData {
    referral_code: string;
    referral_url: string;
    total_invites: number;
    successful_joins: number;
    points_earned: number;
}

export const referralService = {
    async getMyReferralLink(): Promise<ReferralLinkData> {
        const response = await apiClient.get('/referrals/my-link');
        return response.data;
    },

    async sendInvite(email: string): Promise<{ message: string }> {
        const response = await apiClient.post('/referrals/invite', { email });
        return response.data;
    }
};
