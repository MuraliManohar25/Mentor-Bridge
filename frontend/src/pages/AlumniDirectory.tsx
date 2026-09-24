import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { alumniService, Alumni } from '../services/alumniService';

export const AlumniDirectory: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [alumniList, setAlumniList] = useState<Alumni[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const initialSearch = searchParams.get('search') || '';
    const initialDept = searchParams.get('department') || '';

    const [search, setSearch] = useState(initialSearch);
    const [department, setDepartment] = useState(initialDept);
    const [expertise] = useState('');

    const loadDirectory = async () => {
        setLoading(true);
        try {
            const res = await alumniService.getAlumni({
                search: search || undefined,
                department: department || undefined,
                expertise: expertise || undefined,
                is_mentor: true,
                limit: 50
            });
            setAlumniList(res.results);
            setTotal(res.total);
        } catch (err) {
            console.error("Failed to load alumni directory", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDirectory();
    }, [searchParams]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams: Record<string, string> = {};
        if (search) newParams.search = search;
        if (department) newParams.department = department;
        setSearchParams(newParams);
        loadDirectory();
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-7xl mx-auto flex flex-col gap-md">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm border-b border-surface-container-high/40 pb-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]">badge</span>
                            Alumni Mentor Directory
                        </h1>
                        <p className="text-sm text-on-surface-variant">
                            Discover verified alumni mentors across engineering, product, and industry niches for 1-to-1 mentorship.
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-surface-container rounded-full text-on-surface-variant shrink-0 w-fit">
                        {total} Verified Mentors Available
                    </span>
                </div>

                {/* Filter Controls */}
                <form onSubmit={handleFilterSubmit} className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col md:flex-row gap-sm items-center">
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, company, or bio..."
                            className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-sm rounded-lg focus:outline-none focus:bg-surface-container"
                        />
                    </div>

                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full md:w-48 px-3 py-2 bg-surface-container-low text-sm rounded-lg focus:outline-none focus:bg-surface-container text-on-surface"
                    >
                        <option value="">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full md:w-auto px-lg py-2 bg-primary text-on-primary font-semibold text-sm rounded-lg hover:bg-primary-container transition-colors shadow-xs"
                    >
                        Apply Filters
                    </button>
                </form>

                {/* Alumni Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-surface-container-low rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : alumniList.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-xl text-center flex flex-col items-center justify-center gap-sm border border-dashed border-surface-container-high py-16">
                        <span className="material-symbols-outlined text-outline text-[48px]">person_search</span>
                        <h3 className="text-lg font-bold text-on-surface">No mentors found matching your filters</h3>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            Try clearing your search query or selecting a different department to discover more alumni mentors.
                        </p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setDepartment('');
                                setSearchParams({});
                            }}
                            className="mt-xs px-md py-2 bg-surface-container text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {alumniList.map((alumnus) => {
                            const p = alumnus.profile;
                            return (
                                <Link
                                    key={alumnus.id}
                                    to={`/mentors/${alumnus.id}`}
                                    className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between group"
                                >
                                    <div className="flex flex-col gap-sm">
                                        <div className="flex items-start gap-md">
                                            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-xl overflow-hidden shrink-0 shadow-xs">
                                                {p?.avatar_url ? (
                                                    <img src={p.avatar_url} alt={alumnus.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{alumnus.full_name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">
                                                    {alumnus.full_name}
                                                </h3>
                                                <p className="text-xs font-semibold text-on-surface-variant truncate">
                                                    {p?.current_position || 'Alumni'} {p?.current_company ? `@ ${p.current_company}` : ''}
                                                </p>
                                                <p className="text-[11px] text-outline truncate mt-0.5">
                                                    {p?.department || alumnus.department} {p?.graduation_year ? `'${p.graduation_year.toString().slice(-2)}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        {p?.bio && (
                                            <p className="text-xs text-on-surface-variant line-clamp-2 mt-xs">
                                                {p.bio}
                                            </p>
                                        )}

                                        {/* Expertise Pills */}
                                        {p?.mentorship_expertise && p.mentorship_expertise.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-xs">
                                                {p.mentorship_expertise.slice(0, 3).map((exp, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-surface-container-low text-[10px] font-semibold text-on-surface-variant">
                                                        {exp}
                                                    </span>
                                                ))}
                                                {p.mentorship_expertise.length > 3 && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-surface-container-low text-[10px] text-outline">
                                                        +{p.mentorship_expertise.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-md pt-sm border-t border-surface-container flex items-center justify-between">
                                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {p?.availability || 'Available for 1:1'}
                                        </span>
                                        <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                            View Profile →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default AlumniDirectory;
