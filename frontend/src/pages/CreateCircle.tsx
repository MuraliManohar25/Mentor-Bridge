import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { circleService } from '../services/circleService';

export const CreateCircle: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [domain, setDomain] = useState('Software Engineering');
    const [capacity, setCapacity] = useState(25);
    const [schedule, setSchedule] = useState('');
    const [coverImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setLoading(true);
        setErrorMsg('');
        try {
            const res = await circleService.createCircle({
                title: title.trim(),
                description: description.trim(),
                domain,
                capacity,
                schedule: schedule.trim() || undefined,
                cover_image: coverImage.trim() || undefined
            });
            navigate(`/circles/${res.circle_id}`);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to create circle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-3xl mx-auto flex flex-col gap-md">
                <Link to="/circles" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    ← Back to Circles
                </Link>

                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <div className="flex flex-col border-b border-surface-container pb-xs">
                        <h1 className="text-xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[24px]">group_add</span>
                            Create a Community Mentorship Circle
                        </h1>
                        <p className="text-xs text-on-surface-variant">
                            Establish a domain-focused group community for student guidance, live sessions, and Q&A.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-sm bg-error-container text-on-error-container text-xs rounded-lg">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Circle Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Backend Architecture & Scalable Systems"
                                required
                                className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Domain / Topic *</label>
                            <select
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                            >
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Product Management">Product Management</option>
                                <option value="Data Science & AI">Data Science & AI</option>
                                <option value="Hardware & Embedded Systems">Hardware & Embedded Systems</option>
                                <option value="Finance & Consulting">Finance & Consulting</option>
                                <option value="General Career Guidance">General Career Guidance</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Description *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the circle goals, topics covered, target students, and expectations..."
                                rows={4}
                                required
                                className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Seat Capacity (Max Students)</label>
                                <input
                                    type="number"
                                    min={2}
                                    max={500}
                                    value={capacity}
                                    onChange={(e) => setCapacity(parseInt(e.target.value) || 20)}
                                    className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Schedule / Frequency (Optional)</label>
                                <input
                                    type="text"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    placeholder="e.g. Every Tuesday at 6 PM"
                                    className="w-full p-2.5 bg-surface-container-low text-sm rounded-lg border border-surface-container focus:outline-none focus:bg-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-sm pt-xs border-t border-surface-container">
                            <Link to="/circles" className="px-md py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || !title.trim() || !description.trim()}
                                className="px-lg py-2.5 bg-secondary text-on-secondary font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                            >
                                {loading ? 'Creating Circle...' : 'Publish Circle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
};

export default CreateCircle;
