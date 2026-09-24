import apiClient from './api';

export interface LeaderboardUser {
    rank: number;
    user_id: string;
    full_name: string;
    company?: string;
    position?: string;
    avatar_url?: string;
    students_helped: number;
    active_circles: number;
    impact_score: number;
    badges: string[];
    department?: string;
}

export interface ImpactStats {
    students_helped: number;
    active_circles: number;
    global_rank: number | null;
    karma_points: number;
    badges?: string[];
}

export const leaderboardService = {
    async getLeaderboard(): Promise<LeaderboardUser[]> {
        const response = await apiClient.get('/leaderboard');
        return response.data;
    },

    async getMyImpactStats(): Promise<ImpactStats> {
        const response = await apiClient.get('/leaderboard/my-impact');
        return response.data;
    }
};
