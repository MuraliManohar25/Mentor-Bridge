import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';
import { mentorshipService, MentorshipRequest, MentorshipStatus } from '../services/mentorshipService';
import { circleService, Circle } from '../services/circleService';
import { studentBoardService, StudentBoardPost } from '../services/studentBoardService';

export const StudentHome: React.FC = () => {
    const { user } = useAuth();

    const [mentorships, setMentorships] = useState<MentorshipRequest[]>([]);
    const [circles, setCircles] = useState<Circle[]>([]);
    const [boardPosts, setBoardPosts] = useState<StudentBoardPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newQuestionTitle, setNewQuestionTitle] = useState('');
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [posting, setPosting] = useState(false);
    const [postSuccess, setPostSuccess] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [reqsData, circlesData, postsData] = await Promise.all([
                    mentorshipService.getMentorshipRequests().catch(() => []),
                    circleService.getCircles().catch(() => []),
                    studentBoardService.getPosts().catch(() => [])
                ]);
                setMentorships(reqsData);
                setCircles(circlesData.filter((c: Circle) => c.is_member));
                setBoardPosts(postsData);
            } catch (err) {
                console.error("Failed to load student dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;

        setPosting(true);
        try {
            await studentBoardService.createPost({
                title: newQuestionTitle,
                content: newQuestionContent,
                domain: user?.profile?.department || 'General'
            });
            setNewQuestionTitle('');
            setNewQuestionContent('');
            setPostSuccess(true);
            setTimeout(() => setPostSuccess(false), 3000);
            const updated = await studentBoardService.getPosts();
            setBoardPosts(updated);
        } catch (err) {
            console.error("Error creating post", err);
        } finally {
            setPosting(false);
        }
    };

    const acceptedMentorships = mentorships.filter(m => m.status === MentorshipStatus.ACCEPTED);
    const pendingMentorships = mentorships.filter(m => m.status === MentorshipStatus.PENDING);

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-7xl mx-auto">
                <div className="grid grid-cols-12 gap-lg items-start">
                    {/* Main Content Column */}
                    <div className="col-span-12 xl:col-span-8 flex flex-col gap-md">
                        {/* Welcome Banner */}
                        <section className="relative overflow-hidden bg-primary-container rounded-xl p-md text-on-primary shadow-sm">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-secondary-container/10 pointer-events-none blur-2xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
                                <div className="flex flex-col gap-base">
                                    <div className="flex items-center gap-xs flex-wrap">
                                        <span className="font-display-bold text-2xl font-bold tracking-tight text-white">
                                            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
                                        </span>
                                        {user?.profile?.department && (
                                            <span className="inline-flex items-center px-2 py-0.5 bg-surface-container-high/20 rounded-full font-label-bold text-xs text-primary-fixed tracking-wide uppercase">
                                                {user.profile.department} {user.profile.graduation_year ? `'${user.profile.graduation_year.toString().slice(-2)}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-caption-regular text-sm text-primary-fixed-dim max-w-lg">
                                        Campus-to-career mentorship pulse: Connect 1-to-1 with alumni or join community circles.
                                    </p>
                                </div>

                                <div className="flex items-center gap-xs shrink-0 bg-surface-container-lowest/10 p-2.5 rounded-lg backdrop-blur-md border border-white/10">
                                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-secondary-container">
                                        <span className="material-symbols-outlined text-[22px]">event_available</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-label-bold text-xs text-white font-bold">1:1 Mentorship</span>
                                        <span className="font-caption-medium text-xs text-primary-fixed">
                                            {acceptedMentorships.length > 0 ? `${acceptedMentorships.length} Active Mentor(s)` : 'No active mentor yet'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Matrix */}
                            <div className="mt-md pt-sm grid grid-cols-3 gap-xs bg-surface-container-lowest/5 p-xs rounded-lg border border-white/5">
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Active Mentors</span>
                                    <span className="font-display-bold text-xl font-bold text-white mt-1">
                                        {loading ? '...' : acceptedMentorships.length}
                                    </span>
                                </div>
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Circles Joined</span>
                                    <span className="font-display-bold text-xl font-bold text-white mt-1">
                                        {loading ? '...' : circles.length}
                                    </span>
                                </div>
                                <div className="flex flex-col p-xs">
                                    <span className="font-caption-regular text-xs text-primary-fixed-dim">Pending Requests</span>
                                    <div className="flex items-center gap-xs mt-1">
                                        <span className="font-display-bold text-xl font-bold text-secondary-container">
                                            {loading ? '...' : pendingMentorships.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Action Portals */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                            <Link
                                to="/mentors"
                                className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex items-start gap-md group hover:bg-surface-container-low transition-all border border-surface-container-high/40"
                            >
                                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-[24px]">person_search</span>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-body-medium font-bold text-on-surface">Find a Mentor</span>
                                        <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </div>
                                    <p className="font-caption-regular text-xs text-on-surface-variant mt-1">
                                        Browse & filter verified alumni for 1-to-1 mentorship requests.
                                    </p>
                                </div>
                            </Link>

                            <Link
                                to="/circles"
                                className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex items-start gap-md group hover:bg-surface-container-low transition-all border border-surface-container-high/40"
                            >
                                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0 group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-[24px]">group_work</span>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-body-medium font-bold text-on-surface">Explore Circles</span>
                                        <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </div>
                                    <p className="font-caption-regular text-xs text-on-surface-variant mt-1">
                                        Community mentorship fallback for group guidance & peer learning.
                                    </p>
                                </div>
                            </Link>
                        </section>

                        {/* Q&A Board Composer */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                                    <span className="font-caption-medium text-xs font-bold text-on-surface uppercase tracking-wide">
                                        Ask Community & Alumni
                                    </span>
                                </div>
                                <span className="font-label-bold text-xs text-on-surface-variant font-semibold">Instant Board Post</span>
                            </div>

                            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-sm">
                                <input
                                    type="text"
                                    value={newQuestionTitle}
                                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                                    placeholder="Title (e.g., How do I prepare for backend engineering interviews?)"
                                    className="w-full bg-surface-container-low rounded-lg p-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container"
                                />
                                <textarea
                                    value={newQuestionContent}
                                    onChange={(e) => setNewQuestionContent(e.target.value)}
                                    placeholder="Describe your question or guidance request in detail..."
                                    rows={3}
                                    className="w-full bg-surface-container-low rounded-lg p-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container resize-none"
                                />
                                <div className="flex items-center justify-between pt-xs">
                                    {postSuccess ? (
                                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Question posted!
                                        </span>
                                    ) : (
                                        <span className="text-xs text-on-surface-variant">Post visible to alumni & peer students</span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={posting || !newQuestionTitle.trim()}
                                        className="inline-flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary font-label-bold text-xs font-semibold rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">send</span>
                                        <span>{posting ? 'Posting...' : 'Post Question'}</span>
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Recent Student Board Posts */}
                        <section className="flex flex-col gap-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">forum</span>
                                    Community Guidance Board
                                </h2>
                                <Link to="/student-board" className="text-xs text-primary font-semibold hover:underline">
                                    View All
                                </Link>
                            </div>

                            {boardPosts.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-xl p-md text-center flex flex-col items-center justify-center gap-2 border border-dashed border-surface-container-high">
                                    <span className="material-symbols-outlined text-outline text-[32px]">quiz</span>
                                    <p className="text-sm font-semibold text-on-surface">No questions on the board yet</p>
                                    <p className="text-xs text-on-surface-variant max-w-sm">
                                        Be the first student to post a career question or request guidance!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-sm">
                                    {boardPosts.slice(0, 3).map((post) => (
                                        <div key={post.id} className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col gap-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-on-surface">{post.title}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant">
                                                        #{post.domain}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-outline">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant line-clamp-2">{post.content}</p>

                                            {post.responses && post.responses.length > 0 && (
                                                <div className="mt-xs pt-xs border-t border-surface-container bg-surface-container-low/50 p-2 rounded-lg flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-xs font-bold text-on-surface">{post.responses[0].alumni_name} (Alumni)</span>
                                                        <p className="text-xs text-on-surface-variant line-clamp-2">{post.responses[0].content}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Secondary Right Column */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col gap-md">
                        {/* 1:1 Mentorship Requests & Active Mentors Status Card */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                                <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-primary text-[18px]">handshake</span>
                                    1-to-1 Mentorship Status
                                </h3>
                                <Link to="/mentors" className="text-xs text-primary font-semibold hover:underline">
                                    Find Mentor
                                </Link>
                            </div>

                            {mentorships.length === 0 ? (
                                <div className="py-md text-center flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                                        <span className="material-symbols-outlined text-[24px]">person_search</span>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface">You don't have a mentor yet</p>
                                    <p className="text-xs text-on-surface-variant px-4">
                                        Find an alumni mentor who matches your career goals and send a 1-to-1 request.
                                    </p>
                                    <Link
                                        to="/mentors"
                                        className="mt-xs inline-flex items-center gap-1 px-md py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-lg hover:bg-primary-container transition-colors"
                                    >
                                        Find a Mentor
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-xs">
                                    {mentorships.map((req) => (
                                        <div key={req.id} className="p-sm bg-surface-container-low rounded-lg flex items-center justify-between gap-sm">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-xs text-on-surface truncate">{req.alumni_name || 'Alumni Mentor'}</span>
                                                <span className="text-[11px] text-on-surface-variant truncate">{req.alumni_company || req.alumni_position || 'Mentor'}</span>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    req.status === MentorshipStatus.ACCEPTED
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : req.status === MentorshipStatus.PENDING
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}
                                            >
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Community Fallback Callout */}
                            {mentorships.some(m => m.status === MentorshipStatus.REJECTED) && (
                                <div className="mt-xs p-xs bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">info</span> Mentor Unavailable?
                                    </span>
                                    <p className="text-[11px]">
                                        If 1:1 requests are unavailable, try Community Mentorship Circles for group guidance!
                                    </p>
                                    <Link to="/circles" className="text-[11px] font-bold text-amber-800 underline">
                                        Explore Community Mentorship Circles →
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Joined Circles */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm border border-surface-container-high/40">
                            <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                                <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-secondary text-[18px]">group_work</span>
                                    Joined Circles
                                </h3>
                                <Link to="/circles" className="text-xs text-primary font-semibold hover:underline">
                                    Browse
                                </Link>
                            </div>

                            {circles.length === 0 ? (
                                <div className="py-md text-center flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-outline text-[28px]">groups</span>
                                    <p className="text-xs font-bold text-on-surface">No active circles joined</p>
                                    <p className="text-[11px] text-on-surface-variant">
                                        Explore topic-specific group circles led by top alumni mentors.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-xs">
                                    {circles.map((c) => (
                                        <Link
                                            key={c.id}
                                            to={`/circles/${c.id}`}
                                            className="p-sm bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors flex items-center justify-between gap-sm"
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-xs text-on-surface truncate">{c.title}</span>
                                                <span className="text-[11px] text-on-surface-variant truncate">Led by {c.owner_name}</span>
                                            </div>
                                            <span className="text-xs text-outline shrink-0">{c.current_members_count}/{c.capacity}</span>
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

export default StudentHome;
