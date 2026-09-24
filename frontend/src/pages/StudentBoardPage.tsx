import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { studentBoardService, StudentBoardPost } from '../services/studentBoardService';
import { useAuth } from '../context/AuthContext';

export const StudentBoardPage: React.FC = () => {
    const { isStudent, isAlumni } = useAuth();
    const [posts, setPosts] = useState<StudentBoardPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePostId, setActivePostId] = useState<string | null>(null);
    const [responseContent, setResponseContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newDomain, setNewDomain] = useState('Software Engineering');
    const [posting, setPosting] = useState(false);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await studentBoardService.getPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to load student board", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setPosting(true);
        try {
            await studentBoardService.createPost({
                title: newTitle.trim(),
                content: newContent.trim(),
                domain: newDomain
            });
            setNewTitle('');
            setNewContent('');
            await loadPosts();
        } catch (err) {
            console.error("Error creating post", err);
        } finally {
            setPosting(false);
        }
    };

    const handleRespond = async (postId: string) => {
        if (!responseContent.trim()) return;
        setSubmitting(true);
        try {
            await studentBoardService.respondToPost(postId, responseContent.trim());
            setResponseContent('');
            setActivePostId(null);
            await loadPosts();
        } catch (err) {
            console.error("Error submitting response", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-4xl mx-auto flex flex-col gap-md">
                {/* Header */}
                <div className="flex flex-col border-b border-surface-container-high/40 pb-sm">
                    <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px]">help_center</span>
                        Student Guidance Board
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Students ask career questions, mock interview advice, and resume reviews; verified alumni provide guidance.
                    </p>
                </div>

                {/* Question Composer for Students */}
                {isStudent() && (
                    <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-sm">
                        <h2 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[18px]">add_comment</span>
                            Post a Career Question to Alumni
                        </h2>
                        <form onSubmit={handleCreatePost} className="flex flex-col gap-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Question Title (e.g. How to prepare for backend system design)..."
                                    required
                                    className="sm:col-span-2 p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                                />
                                <select
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                                >
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Product Management">Product Management</option>
                                    <option value="Data Science & AI">Data Science & AI</option>
                                    <option value="Hardware">Hardware & EE</option>
                                    <option value="Resume & Interviews">Resume & Interviews</option>
                                </select>
                            </div>
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Detail your question or career bottleneck..."
                                rows={3}
                                required
                                className="w-full p-3 bg-surface-container-low text-sm rounded-xl border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={posting || !newTitle.trim()}
                                    className="px-lg py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container disabled:opacity-50"
                                >
                                    {posting ? 'Posting...' : 'Submit Question'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Posts List */}
                {loading ? (
                    <div className="flex flex-col gap-md">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-surface-container-low rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-xl text-center flex flex-col items-center justify-center gap-sm border border-dashed border-surface-container-high py-16">
                        <span className="material-symbols-outlined text-outline text-[48px]">forum</span>
                        <h3 className="text-lg font-bold text-on-surface">No questions on the student board yet</h3>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            Post a question above to get advice from experienced alumni mentors!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-md">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-base text-on-surface">{post.title}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-secondary">
                                            #{post.domain}
                                        </span>
                                    </div>
                                    <span className="text-xs text-outline">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                    <span>Asked by <strong className="text-on-surface">{post.student_name}</strong> ({post.student_department || 'Student'})</span>
                                </div>

                                <p className="text-sm text-on-surface-variant whitespace-pre-line bg-surface-container-low/50 p-3 rounded-xl">
                                    {post.content}
                                </p>

                                {/* Answers Section */}
                                <div className="mt-xs pt-xs border-t border-surface-container flex flex-col gap-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                                            <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                                            Alumni Responses ({post.responses?.length || 0})
                                        </span>

                                        {isAlumni() && activePostId !== post.id && (
                                            <button
                                                onClick={() => setActivePostId(post.id)}
                                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                + Respond as Alumni
                                            </button>
                                        )}
                                    </div>

                                    {/* Answer Input for Alumni */}
                                    {activePostId === post.id && (
                                        <div className="p-sm bg-surface-container-low rounded-xl flex flex-col gap-xs border border-surface-container mt-xs">
                                            <textarea
                                                value={responseContent}
                                                onChange={(e) => setResponseContent(e.target.value)}
                                                placeholder="Provide your advice or guidance..."
                                                rows={3}
                                                className="w-full p-2.5 text-xs bg-surface-container-lowest rounded-lg focus:outline-none text-on-surface resize-none border border-surface-container"
                                            />
                                            <div className="flex justify-end gap-xs">
                                                <button
                                                    onClick={() => setActivePostId(null)}
                                                    className="px-md py-1 text-xs text-on-surface-variant"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(post.id)}
                                                    disabled={submitting || !responseContent.trim()}
                                                    className="px-md py-1 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container disabled:opacity-50"
                                                >
                                                    {submitting ? 'Submitting...' : 'Submit Answer'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Answers List */}
                                    {post.responses?.map((resp) => (
                                        <div key={resp.id} className="p-sm bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col gap-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    {resp.alumni_name} ({resp.alumni_company || 'Alumni Mentor'})
                                                </span>
                                                <span className="text-[10px] text-emerald-700">{new Date(resp.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-emerald-950 mt-1">{resp.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default StudentBoardPage;
