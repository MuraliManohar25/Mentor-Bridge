import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';
import { mentorshipService, MentorshipRequest, MentorshipStatus } from '../services/mentorshipService';
import { leaderboardService, ImpactStats } from '../services/leaderboardService';
import { studentBoardService, StudentBoardPost } from '../services/studentBoardService';
import { circleService, Circle } from '../services/circleService';
import { alumniService } from '../services/alumniService';

export const AlumniHome: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [impact, setImpact] = useState<ImpactStats>({
        students_helped: 0,
        active_circles: 0,
        global_rank: null,
        karma_points: 0,
        badges: []
    });
    const [studentPosts, setStudentPosts] = useState<StudentBoardPost[]>([]);
    const [myCircles, setMyCircles] = useState<Circle[]>([]);
    const [isMentorActive, setIsMentorActive] = useState<boolean>(user?.profile?.is_mentor ?? true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlumniDashboard = async () => {
            try {
                const [reqsData, impactData, postsData, circlesData] = await Promise.all([
                    mentorshipService.getMentorshipRequests().catch(() => []),
                    leaderboardService.getMyImpactStats().catch(() => ({
                        students_helped: 0,
                        active_circles: 0,
                        global_rank: null,
                        karma_points: 0
                    })),
                    studentBoardService.getPosts().catch(() => []),
                    circleService.getCircles().catch(() => [])
                ]);

                setRequests(reqsData);
                setImpact(impactData);
                setStudentPosts(postsData);
                setMyCircles(circlesData.filter((c: Circle) => c.is_owner));
            } catch (err) {
                console.error("Failed to load alumni dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        loadAlumniDashboard();
    }, []);

    const handleRespondRequest = async (requestId: string, newStatus: MentorshipStatus) => {
        try {
            await mentorshipService.updateRequestStatus(requestId, newStatus);
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
            const freshImpact = await leaderboardService.getMyImpactStats();
            setImpact(freshImpact);
        } catch (err) {
            console.error("Error updating request status", err);
        }
    };

    const handleToggleMentorStatus = async () => {
        try {
            const updated = !isMentorActive;
            await alumniService.updateMentorStatus(updated);
            setIsMentorActive(updated);
        } catch (err) {
            console.error("Error toggling status", err);
        }
    };

    const pendingRequests = requests.filter(r => r.status === MentorshipStatus.PENDING);
    const acceptedRequests = requests.filter(r => r.status === MentorshipStatus.ACCEPTED);

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-7xl mx-auto">
                <div className="grid grid-cols-12 gap-lg items-start">
                    {/* Main Left Column */}
                    <div className="col-span-12 xl:col-span-8 flex flex-col gap-md">
                        {/* Welcome Banner */}
                        <section className="relative overflow-hidden bg-primary-container rounded-xl p-md text-on-primary shadow-sm">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-secondary-container/10 pointer-events-none blur-2xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
                                <div className="flex flex-col gap-base">
                                    <div className="flex items-center gap-xs flex-wrap">
                                        <span className="font-display-bold text-2xl font-bold tracking-tight text-white">
                                            Welcome back, {user?.full_name?.split(' ')[0] || 'Mentor'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 bg-surface-container-high/20 rounded-full font-label-bold text-xs text-primary-fixed tracking-wide uppercase">
                                            {user?.profile?.current_position || 'Alumni Mentor'} {user?.profile?.current_company ? `@ ${user.profile.current_company}` : ''}
                                        </span>
                                    </div>
                                    <p className="font-caption-regular text-sm text-primary-fixed-dim max-w-lg">
                                        Your alumni impact dashboard. Accept 1:1 mentorship requests or lead community circles.
                                    </p>
                                </div>

                                <div className="flex items-center gap-xs shrink-0 bg-surface-container-lowest/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                                    <span className="text-xs text-white font-semibold">Mentoring Status:</span>
                                    <button
                                        type="button"
                                        onClick={handleToggleMentorStatus}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                            isMentorActive ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                                        }`}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-white"></span>
                                        {isMentorActive ? 'Available' : 'Paused'}
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Database Statistics */}
                            <div className="mt-md pt-sm grid grid-cols-3 gap-xs bg-surface-container-lowest/5 p-xs rounded-lg border border-white/5">
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Students Helped</span>
                                    <span className="font-display-bold text-xl font-bold text-white mt-1">
                                        {loading ? '...' : impact.students_helped}
                                    </span>
                                </div>
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Active Circles</span>
                                    <span className="font-display-bold text-xl font-bold text-white mt-1">
                                        {loading ? '...' : impact.active_circles}
                                    </span>
                                </div>
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Global Rank</span>
                                    <span className="font-display-bold text-xl font-bold text-secondary-container mt-1">
                                        {loading ? '...' : impact.global_rank ? `#${impact.global_rank}` : 'Unranked'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Incoming Mentorship Requests */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">inbox</span>
                                    Incoming Mentorship Requests ({pendingRequests.length})
                                </h2>
                            </div>

                            {pendingRequests.length === 0 ? (
                                <div className="py-md text-center flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                                        <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface">No pending mentorship requests</p>
                                    <p className="text-xs text-on-surface-variant max-w-sm">
                                        {impact.students_helped === 0
                                            ? "You haven't helped a student yet. Complete your mentor profile so students can discover you!"
                                            : "You're all caught up! New student requests will appear here."}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-sm">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="p-md bg-surface-container-low rounded-xl flex flex-col gap-xs border border-surface-container">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-on-surface">{req.student_name || 'Student'}</span>
                                                    <span className="text-xs text-on-surface-variant">({req.student_department || 'Student'})</span>
                                                </div>
                                                <span className="text-xs text-outline">{new Date(req.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <p className="text-xs text-on-surface bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container">
                                                "{req.message}"
                                            </p>

                                            <div className="flex items-center justify-end gap-xs pt-xs">
                                                <button
                                                    onClick={() => handleRespondRequest(req.id, MentorshipStatus.REJECTED)}
                                                    className="px-md py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => handleRespondRequest(req.id, MentorshipStatus.ACCEPTED)}
                                                    className="px-md py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors"
                                                >
                                                    Accept 1:1 Request
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Student Board Questions Needing Mentor Answers */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-[20px]">help</span>
                                    Student Questions Needing Advice
                                </h2>
                                <Link to="/student-board" className="text-xs text-primary font-semibold hover:underline">
                                    Browse Board
                                </Link>
                            </div>

                            {studentPosts.length === 0 ? (
                                <p className="text-xs text-on-surface-variant py-sm text-center">No open student questions.</p>
                            ) : (
                                <div className="flex flex-col gap-sm">
                                    {studentPosts.slice(0, 3).map((post) => (
                                        <div key={post.id} className="p-sm bg-surface-container-low rounded-lg flex flex-col gap-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-on-surface">{post.title}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container font-semibold">
                                                    #{post.domain}
                                                </span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant line-clamp-2">{post.content}</p>
                                            <div className="flex justify-end pt-xs">
                                                <Link
                                                    to="/student-board"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    Answer Question →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Secondary Right Column */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col gap-md">
                        {/* Quick Mentor Actions */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs">
                                Mentor Quick Actions
                            </h3>
                            <div className="flex flex-col gap-xs">
                                <Link
                                    to="/posts/create"
                                    className="p-sm bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors flex items-center gap-sm text-xs font-semibold text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-primary text-[20px]">rate_review</span>
                                    <span>Create Career Post / Tip</span>
                                </Link>
                                <Link
                                    to="/circles/create"
                                    className="p-sm bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors flex items-center gap-sm text-xs font-semibold text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-secondary text-[20px]">group_add</span>
                                    <span>Create Community Circle</span>
                                </Link>
                                <Link
                                    to="/referrals"
                                    className="p-sm bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors flex items-center gap-sm text-xs font-semibold text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">person_add</span>
                                    <span>Invite Fellow Alumni</span>
                                </Link>
                            </div>
                        </section>

                        {/* Active Mentees / Relationships */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs">
                                Active 1:1 Mentees ({acceptedRequests.length})
                            </h3>

                            {acceptedRequests.length === 0 ? (
                                <p className="text-xs text-on-surface-variant py-xs text-center">No active mentees currently.</p>
                            ) : (
                                <div className="flex flex-col gap-xs">
                                    {acceptedRequests.map((r) => (
                                        <div key={r.id} className="p-xs bg-surface-container-low rounded-lg flex items-center justify-between">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-xs text-on-surface">{r.student_name}</span>
                                                <span className="text-[10px] text-on-surface-variant">{r.student_department}</span>
                                            </div>
                                            <Link
                                                to="/messages"
                                                className="p-1 rounded bg-surface-container text-primary hover:bg-surface-container-high transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* My Owned Circles */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                                <h3 className="font-bold text-sm text-on-surface">My Circles ({myCircles.length})</h3>
                                <Link to="/circles/create" className="text-xs text-primary font-semibold hover:underline">+ New</Link>
                            </div>

                            {myCircles.length === 0 ? (
                                <p className="text-xs text-on-surface-variant py-xs text-center">You haven't created a circle yet.</p>
                            ) : (
                                <div className="flex flex-col gap-xs">
                                    {myCircles.map((c) => (
                                        <Link key={c.id} to={`/circles/${c.id}`} className="p-xs bg-surface-container-low rounded-lg hover:bg-surface-container flex items-center justify-between">
                                            <span className="font-bold text-xs text-on-surface truncate">{c.title}</span>
                                            <span className="text-[10px] text-outline">{c.current_members_count} members</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default AlumniHome;
