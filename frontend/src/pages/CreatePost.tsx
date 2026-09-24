import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

export const CreatePost: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [postType, setPostType] = useState('advice');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setErrorMsg('');
        try {
            await feedService.createPost({
                content: content.trim(),
                media_url: mediaUrl.trim() || undefined,
                post_type: postType
            });
            navigate('/feed');
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-2xl mx-auto flex flex-col gap-md">
                <Link to="/feed" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    ← Back to Feed
                </Link>

                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <div className="flex flex-col border-b border-surface-container pb-xs">
                        <h1 className="text-xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[24px]">edit_note</span>
                            Create Mentor Career Post
                        </h1>
                        <p className="text-xs text-on-surface-variant">
                            Share advice, career insights, job openings, or interview guidance with students.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-sm bg-error-container text-on-error-container text-xs rounded-lg">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                        {/* Author Preview */}
                        <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg">
                            <span className="text-xs font-bold text-on-surface">Publishing as:</span>
                            <span className="text-xs text-primary font-semibold">{user?.full_name} ({user?.profile?.current_position || 'Mentor'})</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Category / Post Type</label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value)}
                                className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                            >
                                <option value="advice">Career Advice & Tips</option>
                                <option value="job">Job Opportunity / Internship</option>
                                <option value="event">Event / Live Webinar</option>
                                <option value="general">General Insight</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Post Content *</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your career advice, resume tips, or job opportunity breakdown here..."
                                rows={6}
                                required
                                className="w-full p-3 bg-surface-container-low text-sm rounded-xl border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Optional Cover / Image URL</label>
                            <input
                                type="url"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-sm pt-xs border-t border-surface-container">
                            <Link to="/feed" className="px-md py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || !content.trim()}
                                className="px-lg py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all shadow-xs"
                            >
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
};

export default CreatePost;
