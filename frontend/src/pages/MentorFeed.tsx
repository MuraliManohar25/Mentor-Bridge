import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { feedService, Post } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

export const MentorFeed: React.FC = () => {
    const { isAlumni } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('');

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await feedService.getPosts({ post_type: filterType || undefined });
            setPosts(data);
        } catch (err) {
            console.error("Failed to load feed posts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [filterType]);

    const handleToggleLike = async (postId: string) => {
        try {
            const res = await feedService.toggleLike(postId);
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        has_liked: res.liked,
                        likes_count: res.liked ? p.likes_count + 1 : p.likes_count - 1
                    };
                }
                return p;
            }));
        } catch (err) {
            console.error("Error toggling like", err);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-4xl mx-auto flex flex-col gap-md">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm border-b border-surface-container-high/40 pb-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]">feed</span>
                            Mentor Career Feed
                        </h1>
                        <p className="text-sm text-on-surface-variant">
                            Insights, interview tips, job postings, and career guidance published directly by alumni.
                        </p>
                    </div>

                    {isAlumni() && (
                        <Link
                            to="/posts/create"
                            className="inline-flex items-center gap-xs px-md py-2 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-container transition-colors shadow-xs shrink-0 w-fit"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit_square</span>
                            <span>Create Post</span>
                        </Link>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-xs overflow-x-auto pb-xs border-b border-surface-container">
                    {[
                        { id: '', label: 'All Posts' },
                        { id: 'advice', label: 'Career Advice' },
                        { id: 'job', label: 'Job Opportunities' },
                        { id: 'event', label: 'Events & Webinars' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterType(tab.id)}
                            className={`px-md py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                                filterType === tab.id
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Feed Items */}
                {loading ? (
                    <div className="flex flex-col gap-md">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 bg-surface-container-low rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-xl text-center flex flex-col items-center justify-center gap-sm border border-dashed border-surface-container-high py-16">
                        <span className="material-symbols-outlined text-outline text-[48px]">dynamic_feed</span>
                        <h3 className="text-lg font-bold text-on-surface">No feed posts published yet</h3>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            Mentors publish career insights and job opportunities here. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-md">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-sm">
                                {/* Author Banner */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-md">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-base overflow-hidden">
                                            {post.author_avatar ? (
                                                <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{post.author_name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-on-surface">{post.author_name}</span>
                                            <span className="text-xs text-on-surface-variant">
                                                {post.author_position || 'Alumni Mentor'} {post.author_company ? `@ ${post.author_company}` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-xs text-outline font-medium">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed">
                                    {post.content}
                                </p>

                                {/* Media if any */}
                                {post.media_url && (
                                    <div className="rounded-xl overflow-hidden max-h-80 bg-surface-container-low">
                                        <img src={post.media_url} alt="Post Attachment" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-xs pt-xs border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                                    <button
                                        onClick={() => handleToggleLike(post.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                                            post.has_liked ? 'text-secondary bg-secondary-container/20' : 'hover:bg-surface-container-low'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${post.has_liked ? 'text-secondary' : 'text-outline'}`}>
                                            favorite
                                        </span>
                                        <span>{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
                                    </button>

                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px] text-outline">chat_bubble</span>
                                        <span>{post.comments_count} Comments</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default MentorFeed;
