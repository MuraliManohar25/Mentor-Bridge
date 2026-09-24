import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { circleService, Circle } from '../services/circleService';
import { useAuth } from '../context/AuthContext';

export const CirclesList: React.FC = () => {
    const { isAlumni } = useAuth();
    const [circles, setCircles] = useState<Circle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadCircles = async () => {
            setLoading(true);
            try {
                const data = await circleService.getCircles({ search: search || undefined });
                setCircles(data);
            } catch (err) {
                console.error("Failed to load circles", err);
            } finally {
                setLoading(false);
            }
        };

        loadCircles();
    }, [search]);

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-7xl mx-auto flex flex-col gap-md">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm border-b border-surface-container-high/40 pb-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[28px]">group_work</span>
                            Community Mentorship Circles
                        </h1>
                        <p className="text-sm text-on-surface-variant">
                            Secondary & group mentorship layer. Join domain-specific circles led by experienced alumni mentors.
                        </p>
                    </div>

                    {isAlumni() && (
                        <Link
                            to="/circles/create"
                            className="inline-flex items-center gap-xs px-md py-2 bg-secondary text-on-secondary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-xs shrink-0 w-fit"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Create Circle</span>
                        </Link>
                    )}
                </div>

                {/* Search */}
                <div className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex items-center">
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search community circles by topic or domain..."
                            className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-sm rounded-lg focus:outline-none focus:bg-surface-container text-on-surface"
                        />
                    </div>
                </div>

                {/* Circles Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-56 bg-surface-container-low rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : circles.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-xl text-center flex flex-col items-center justify-center gap-sm border border-dashed border-surface-container-high py-16">
                        <span className="material-symbols-outlined text-outline text-[48px]">groups</span>
                        <h3 className="text-lg font-bold text-on-surface">No community circles available yet</h3>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            Be the first mentor to create a community circle for group mentorship and peer learning!
                        </p>
                        {isAlumni() && (
                            <Link to="/circles/create" className="mt-xs px-md py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg">
                                Create a Circle
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {circles.map((c) => (
                            <Link
                                key={c.id}
                                to={`/circles/${c.id}`}
                                className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
                            >
                                <div className="flex flex-col gap-sm">
                                    {c.cover_image && (
                                        <div className="h-32 -mx-md -mt-md mb-2 overflow-hidden relative bg-surface-container">
                                            <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase">
                                                {c.domain}
                                            </span>
                                        </div>
                                    )}

                                    {!c.cover_image && (
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-bold text-secondary uppercase">
                                                {c.domain}
                                            </span>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                                        {c.title}
                                    </h3>
                                    <p className="text-xs text-on-surface-variant line-clamp-2">
                                        {c.description}
                                    </p>
                                </div>

                                <div className="mt-md pt-sm border-t border-surface-container flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">
                                            {c.owner_name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold text-on-surface truncate max-w-[120px]">
                                            {c.owner_name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-outline font-semibold">
                                        {c.current_members_count} / {c.capacity} Members
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default CirclesList;
