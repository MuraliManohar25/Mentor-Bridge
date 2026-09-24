import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { leaderboardService, LeaderboardUser } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';

export const LeaderboardPage: React.FC = () => {
    const { user, isAlumni } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await leaderboardService.getLeaderboard();
                setLeaderboard(data);
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    const myEntry = leaderboard.find(item => item.user_id === user?.id);

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-5xl mx-auto flex flex-col gap-md">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm border-b border-surface-container-high/40 pb-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-[28px]">leaderboard</span>
                            Mentor Recognition & Leaderboard
                        </h1>
                        <p className="text-sm text-on-surface-variant">
                            Calculated real impact scores from 1-to-1 mentorships completed, community circles led, and student contributions.
                        </p>
                    </div>

                    {isAlumni() && (
                        <div className="bg-surface-container-low px-md py-2 rounded-xl border border-surface-container flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-[20px]">workspace_premium</span>
                            <div className="flex flex-col text-xs">
                                <span className="font-bold text-on-surface">Your Position</span>
                                <span className="text-on-surface-variant">
                                    {myEntry ? `#${myEntry.rank} Global Rank (${myEntry.impact_score} pts)` : 'Unranked yet'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Unranked / New Mentor Notice */}
                {isAlumni() && !myEntry && (
                    <div className="p-md bg-surface-container-lowest rounded-xl border border-dashed border-surface-container-high text-xs text-on-surface-variant flex items-center gap-md">
                        <span className="material-symbols-outlined text-primary text-[28px]">emoji_events</span>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-on-surface">Your ranking will appear after you begin contributing</span>
                            <span>Accept student 1-to-1 requests or host a community circle to earn karma points & badges!</span>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/40 overflow-hidden">
                    {loading ? (
                        <div className="p-md text-xs text-outline animate-pulse">Loading calculated leaderboard rankings...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-xl text-center text-xs text-on-surface-variant">No ranked mentors found.</div>
                    ) : (
                        <div className="divide-y divide-surface-container">
                            {leaderboard.map((entry) => (
                                <div
                                    key={entry.user_id}
                                    className={`p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md transition-colors ${
                                        entry.user_id === user?.id ? 'bg-primary-container/10 font-bold border-l-4 border-l-primary' : 'hover:bg-surface-container-low/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-md">
                                        {/* Rank Badge */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                            entry.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                            entry.rank === 2 ? 'bg-slate-200 text-slate-800' :
                                            entry.rank === 3 ? 'bg-amber-950/10 text-amber-800' :
                                            'bg-surface-container text-on-surface-variant'
                                        }`}>
                                            #{entry.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden shrink-0">
                                            {entry.avatar_url ? (
                                                <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{entry.full_name.charAt(0)}</span>
                                            )}
                                        </div>

                                        {/* Mentor Details */}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-on-surface">{entry.full_name}</span>
                                            <span className="text-xs text-on-surface-variant">
                                                {entry.position || 'Alumni'} {entry.company ? `@ ${entry.company}` : ''}
                                            </span>
                                            {entry.badges && entry.badges.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {entry.badges.map((b, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                                                            🏆 {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-lg text-xs shrink-0 self-end sm:self-auto">
                                        <div className="flex flex-col text-right">
                                            <span className="font-bold text-on-surface">{entry.students_helped}</span>
                                            <span className="text-[10px] text-outline">Students Helped</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="font-bold text-on-surface">{entry.active_circles}</span>
                                            <span className="text-[10px] text-outline">Circles Led</span>
                                        </div>
                                        <div className="flex flex-col text-right bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
                                            <span className="font-bold text-primary text-sm">{entry.impact_score}</span>
                                            <span className="text-[10px] text-outline">Karma Points</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
};

export default LeaderboardPage;
