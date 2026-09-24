import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { feedService, Post } from '../services/feedService';

export const SinglePostView: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadPost = async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const data = await feedService.getPostDetail(postId);
            setPost(data);
        } catch (err) {
            console.error("Failed to load single post", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [postId]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postId || !commentText.trim()) return;

        setSubmitting(true);
        try {
            await feedService.addComment(postId, commentText.trim());
            setCommentText('');
            await loadPost();
        } catch (err) {
            console.error("Error posting comment", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="max-w-3xl mx-auto p-md animate-pulse">
                    <div className="h-64 bg-surface-container-low rounded-xl"></div>
                </div>
            </AppShell>
        );
    }

    if (!post) {
        return (
            <AppShell>
                <div className="max-w-xl mx-auto py-16 text-center">
                    <h2 className="text-xl font-bold">Post Not Found</h2>
                    <Link to="/feed" className="mt-md inline-block text-primary font-bold">← Back to Feed</Link>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-3xl mx-auto flex flex-col gap-md">
                <Link to="/feed" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    ← Back to Career Feed
                </Link>

                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    {/* Author Header */}
                    <div className="flex items-center justify-between border-b border-surface-container pb-md">
                        <div className="flex items-center gap-md">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-lg overflow-hidden">
                                {post.author_avatar ? (
                                    <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{post.author_name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="font-bold text-base text-on-surface">{post.author_name}</h2>
                                <p className="text-xs text-on-surface-variant">
                                    {post.author_position || 'Alumni Mentor'} {post.author_company ? `@ ${post.author_company}` : ''}
                                </p>
                            </div>
                        </div>

                        <span className="text-xs text-outline">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed">
                        {post.content}
                    </p>

                    {post.media_url && (
                        <div className="rounded-xl overflow-hidden bg-surface-container-low max-h-96">
                            <img src={post.media_url} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="mt-md border-t border-surface-container pt-md flex flex-col gap-md">
                        <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                            Comments ({post.comments?.length || 0})
                        </h3>

                        {/* Comment Composer */}
                        <form onSubmit={handleAddComment} className="flex flex-col gap-xs">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment or follow-up question..."
                                rows={3}
                                className="w-full p-3 bg-surface-container-low text-sm rounded-xl focus:outline-none focus:bg-surface-container text-on-surface resize-none border border-surface-container"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !commentText.trim()}
                                    className="px-md py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container disabled:opacity-50"
                                >
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="flex flex-col gap-sm">
                            {(!post.comments || post.comments.length === 0) ? (
                                <p className="text-xs text-on-surface-variant py-xs text-center">No comments yet. Start the conversation!</p>
                            ) : (
                                post.comments.map(c => (
                                    <div key={c.id} className="p-sm bg-surface-container-low rounded-xl flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-on-surface">{c.author_name}</span>
                                            <span className="text-[10px] text-outline">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant mt-1">{c.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default SinglePostView;
