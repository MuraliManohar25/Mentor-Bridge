import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { circleService, Circle } from '../services/circleService';
import { useAuth } from '../context/AuthContext';

export const CircleDetail: React.FC = () => {
    const { circleId } = useParams<{ circleId: string }>();
    useAuth();
    const [circle, setCircle] = useState<Circle | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    const loadDetail = async () => {
        if (!circleId) return;
        setLoading(true);
        try {
            const data = await circleService.getCircleDetail(circleId);
            setCircle(data);
        } catch (err) {
            console.error("Failed to load circle detail", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetail();
    }, [circleId]);

    const handleJoin = async () => {
        if (!circleId) return;
        setJoining(true);
        try {
            await circleService.joinCircle(circleId);
            await loadDetail();
        } catch (err: any) {
            alert(err.message || "Failed to join circle");
        } finally {
            setJoining(false);
        }
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!circleId || !postContent.trim()) return;

        setPosting(true);
        try {
            await circleService.addCirclePost(circleId, postContent.trim());
            setPostContent('');
            await loadDetail();
        } catch (err: any) {
            alert(err.message || "Failed to post");
        } finally {
            setPosting(false);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="max-w-4xl mx-auto p-md animate-pulse">
                    <div className="h-64 bg-surface-container-low rounded-xl"></div>
                </div>
            </AppShell>
        );
    }

    if (!circle) {
        return (
            <AppShell>
                <div className="max-w-xl mx-auto py-16 text-center">
                    <h2 className="text-xl font-bold">Circle Not Found</h2>
                    <Link to="/circles" className="mt-md inline-block text-primary font-bold">← Back to Circles</Link>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-5xl mx-auto flex flex-col gap-md">
                <Link to="/circles" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    ← Back to Circles
                </Link>

                {/* Hero Card */}
                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                        <div className="flex flex-col gap-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-bold text-secondary uppercase w-fit">
                                #{circle.domain}
                            </span>
                            <h1 className="text-2xl font-bold font-display-bold text-on-surface">{circle.title}</h1>
                            <p className="text-xs text-on-surface-variant">
                                Led by <span className="font-bold text-on-surface">{circle.owner_name}</span> ({circle.owner_company || 'Alumni Mentor'})
                            </p>
                        </div>

                        <div className="flex items-center gap-sm">
                            {circle.is_member ? (
                                <span className="px-md py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Joined Member
                                </span>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining || circle.current_members_count >= circle.capacity}
                                    className="px-lg py-2.5 bg-secondary text-on-secondary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                                >
                                    {joining ? 'Joining...' : 'Join Circle'}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-on-surface-variant border-t border-surface-container pt-md">
                        {circle.description}
                    </p>

                    <div className="flex items-center gap-md text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg flex-wrap">
                        <span className="font-semibold">Capacity: {circle.current_members_count} / {circle.capacity} Members</span>
                        {circle.schedule && <span className="font-semibold text-primary">Schedule: {circle.schedule}</span>}
                    </div>
                </div>

                {/* Grid: Discussion Feed & Members / Sessions Sidebar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="md:col-span-2 flex flex-col gap-md">
                        {/* Discussion Post Composer */}
                        {circle.is_member && (
                            <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-xs">
                                <h3 className="font-bold text-xs text-on-surface uppercase tracking-wide flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[18px]">edit</span> Post to Circle
                                </h3>
                                <form onSubmit={handleAddPost} className="flex flex-col gap-xs mt-xs">
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="Share a topic, resource, or question with circle members..."
                                        rows={3}
                                        className="w-full p-3 bg-surface-container-low text-sm rounded-xl focus:outline-none focus:bg-surface-container resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={posting || !postContent.trim()}
                                            className="px-md py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container disabled:opacity-50"
                                        >
                                            {posting ? 'Posting...' : 'Post Message'}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        {/* Circle Feed Posts */}
                        <section className="flex flex-col gap-sm">
                            <h3 className="font-bold text-sm text-on-surface">Circle Discussion Board</h3>
                            {(!circle.posts || circle.posts.length === 0) ? (
                                <div className="bg-surface-container-lowest p-md rounded-xl text-center text-xs text-on-surface-variant">
                                    No posts in this circle yet.
                                </div>
                            ) : (
                                circle.posts.map(p => (
                                    <div key={p.id} className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col gap-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-on-surface">{p.author_name}</span>
                                            <span className="text-[10px] text-outline">{new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant">{p.content}</p>
                                    </div>
                                ))
                            )}
                        </section>
                    </div>

                    {/* Right Sidebar: Members & Sessions */}
                    <div className="flex flex-col gap-md">
                        {/* Upcoming Sessions */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-xs">
                            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wide border-b border-surface-container pb-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-secondary text-[18px]">event</span> Scheduled Sessions
                            </h3>
                            {(!circle.sessions || circle.sessions.length === 0) ? (
                                <p className="text-xs text-on-surface-variant py-xs">No upcoming live sessions.</p>
                            ) : (
                                circle.sessions.map(s => (
                                    <div key={s.id} className="p-xs bg-surface-container-low rounded-lg flex flex-col gap-0.5 mt-xs">
                                        <span className="font-bold text-xs text-on-surface">{s.title}</span>
                                        <span className="text-[10px] text-primary">{new Date(s.scheduled_at).toLocaleString()}</span>
                                        {s.meeting_link && (
                                            <a href={s.meeting_link} target="_blank" rel="noreferrer" className="text-[10px] text-secondary font-bold underline mt-1">
                                                Join Live Session →
                                            </a>
                                        )}
                                    </div>
                                ))
                            )}
                        </section>

                        {/* Members List */}
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-xs">
                            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wide border-b border-surface-container pb-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-primary text-[18px]">group</span> Members ({circle.members?.length || 0})
                            </h3>
                            <div className="flex flex-col gap-xs max-h-60 overflow-y-auto py-xs">
                                {circle.members?.map(m => (
                                    <div key={m.id} className="flex items-center gap-2 p-1 rounded hover:bg-surface-container-low">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">
                                            {m.full_name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-on-surface truncate">{m.full_name}</span>
                                            <span className="text-[10px] text-outline uppercase">{m.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default CircleDetail;
