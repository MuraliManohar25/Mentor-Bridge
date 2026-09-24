import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';
import { alumniService, Alumni } from '../services/alumniService';
import { mentorshipService, MentorshipRequest, MentorshipStatus } from '../services/mentorshipService';

export const MentorProfile: React.FC = () => {
    const { mentorId } = useParams<{ mentorId: string }>();
    const { user, isStudent } = useAuth();
    const navigate = useNavigate();

    const [alumnus, setAlumnus] = useState<Alumni | null>(null);
    const [existingRequest, setExistingRequest] = useState<MentorshipRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadMentorData = async () => {
            if (!mentorId) return;
            setLoading(true);
            try {
                const alumniData = await alumniService.getAlumniProfile(mentorId);
                setAlumnus(alumniData);

                if (user && isStudent()) {
                    const myRequests = await mentorshipService.getMentorshipRequests();
                    const matched = myRequests.find((r: MentorshipRequest) => r.alumni_id === mentorId);
                    setExistingRequest(matched || null);
                }
            } catch (err) {
                console.error("Error loading mentor profile", err);
            } finally {
                setLoading(false);
            }
        };

        loadMentorData();
    }, [mentorId, user]);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mentorId || !requestMessage.trim()) return;

        setSending(true);
        setErrorMsg('');
        try {
            const newReq = await mentorshipService.sendMentorshipRequest({
                alumni_id: mentorId,
                message: requestMessage.trim()
            });
            setExistingRequest(newReq);
            setShowModal(false);
            setRequestMessage('');
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to send request");
        } finally {
            setSending(false);
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

    if (!alumnus) {
        return (
            <AppShell>
                <div className="max-w-xl mx-auto py-16 text-center">
                    <h2 className="text-xl font-bold">Mentor Profile Not Found</h2>
                    <Link to="/mentors" className="mt-md inline-block text-primary font-bold">← Back to Directory</Link>
                </div>
            </AppShell>
        );
    }

    const p = alumnus.profile;

    // Determine 1:1 Request Button State
    const getRequestButtonState = () => {
        if (!isStudent()) {
            return { text: 'Alumni Profile', disabled: true, class: 'bg-surface-container text-on-surface-variant' };
        }
        if (!existingRequest) {
            return { text: 'Request 1:1 Mentorship', disabled: false, class: 'bg-primary text-on-primary hover:bg-primary-container shadow-md' };
        }
        if (existingRequest.status === MentorshipStatus.PENDING) {
            return { text: 'Request Pending', disabled: true, class: 'bg-amber-100 text-amber-800 border border-amber-300' };
        }
        if (existingRequest.status === MentorshipStatus.ACCEPTED) {
            return { text: 'Mentorship Active (Message Mentor)', disabled: false, isMessage: true, class: 'bg-emerald-600 text-white hover:bg-emerald-700' };
        }
        return { text: 'Request Declined', disabled: true, isDeclined: true, class: 'bg-rose-100 text-rose-800' };
    };

    const buttonState = getRequestButtonState();

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-5xl mx-auto flex flex-col gap-md">
                {/* Back Link */}
                <Link to="/mentors" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    ← Back to Mentor Directory
                </Link>

                {/* Profile Hero Card */}
                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col md:flex-row gap-lg items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary flex items-center justify-center text-on-primary text-3xl font-bold overflow-hidden shrink-0 shadow-md">
                        {p?.avatar_url ? (
                            <img src={p.avatar_url} alt={alumnus.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{alumnus.full_name.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col gap-sm w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold font-display-bold text-on-surface">{alumnus.full_name}</h1>
                                <p className="text-sm font-semibold text-primary">
                                    {p?.current_position || 'Alumni'} {p?.current_company ? `@ ${p.current_company}` : ''}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-1">
                                    {p?.department || alumnus.department} Class of '{p?.graduation_year?.toString().slice(-2) || 'Alumni'}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col gap-1 w-full md:w-auto">
                                <button
                                    type="button"
                                    disabled={buttonState.disabled}
                                    onClick={() => {
                                        if (buttonState.isMessage) {
                                            navigate('/messages');
                                        } else if (!buttonState.disabled) {
                                            setShowModal(true);
                                        }
                                    }}
                                    className={`px-lg py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${buttonState.class}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {buttonState.isMessage ? 'chat' : 'handshake'}
                                    </span>
                                    <span>{buttonState.text}</span>
                                </button>
                            </div>
                        </div>

                        {/* Availability Callout */}
                        <div className="flex items-center gap-md text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg border border-surface-container mt-xs flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {p?.availability || 'Available'}
                            </span>
                            {p?.location && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    {p.location}
                                </span>
                            )}
                            {p?.linkedin_url && (
                                <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">link</span> LinkedIn
                                </a>
                            )}
                        </div>

                        {/* Fallback Notice if Declined */}
                        {buttonState.isDeclined && (
                            <div className="p-sm bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex flex-col gap-1 mt-xs">
                                <span className="font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">group_work</span> Secondary Mentorship Option
                                </span>
                                <p>
                                    This mentor is currently unavailable for 1-to-1 mentorship. You can explore Community Mentorship Circles for scalable group guidance!
                                </p>
                                <Link to="/circles" className="font-bold text-amber-900 underline mt-1">
                                    Explore Community Mentorship Circles →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    {/* Bio & Experience */}
                    <div className="md:col-span-2 flex flex-col gap-md">
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-xs">
                            <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                About Mentor
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed py-xs">
                                {p?.bio || "No bio details provided yet."}
                            </p>
                        </section>

                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-xs">
                            <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[18px]">work</span>
                                Professional Experience & Role
                            </h3>
                            <div className="py-xs flex flex-col gap-xs text-sm">
                                <p className="font-bold text-on-surface">{p?.current_position || 'Mentor'}</p>
                                <p className="text-xs text-on-surface-variant">{p?.current_company || 'Company'}</p>
                                <p className="text-xs text-outline">Department: {p?.department || 'Engineering'}</p>
                            </div>
                        </section>
                    </div>

                    {/* Expertise Sidebar */}
                    <div className="flex flex-col gap-md">
                        <section className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container-high/40 flex flex-col gap-sm">
                            <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                                Skills & Mentorship Expertise
                            </h3>

                            {p?.mentorship_expertise && p.mentorship_expertise.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 py-xs">
                                    {p.mentorship_expertise.map((exp, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-on-surface-variant py-xs">General Mentorship</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Mentorship Request Dialog Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-md">
                    <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-md shadow-2xl border border-surface-container flex flex-col gap-md animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-surface-container pb-xs">
                            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">handshake</span>
                                Request 1:1 Mentorship with {alumnus.full_name}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-outline hover:text-on-surface">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-sm bg-error-container text-on-error-container text-xs rounded-lg">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSendRequest} className="flex flex-col gap-sm">
                            <label className="text-xs font-bold text-on-surface">
                                Introduce yourself & explain what guidance you are seeking:
                            </label>
                            <textarea
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                placeholder="Hi Sarah, I would love your guidance on preparing for backend engineering interviews and reviewing my system design projects..."
                                rows={5}
                                required
                                className="w-full p-3 text-sm bg-surface-container-low rounded-xl focus:outline-none focus:bg-surface-container text-on-surface border border-surface-container resize-none"
                            />

                            <div className="flex items-center justify-end gap-sm pt-xs border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-md py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending || !requestMessage.trim()}
                                    className="px-lg py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors shadow-xs"
                                >
                                    {sending ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
};

export default MentorProfile;
