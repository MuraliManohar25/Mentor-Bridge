import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { AppShell } from '../components/AppShell';

export const AlumniProfileSetup: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [currentCompany, setCurrentCompany] = useState(user?.profile?.current_company || '');
    const [currentPosition, setCurrentPosition] = useState(user?.profile?.current_position || '');
    const [department, setDepartment] = useState(user?.profile?.department || 'Computer Science');
    const [graduationYear, setGraduationYear] = useState<number>(user?.profile?.graduation_year || 2018);
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [expertise, setExpertise] = useState(user?.profile?.mentorship_expertise?.join(', ') || 'Software Engineering, System Design, Career Growth');
    const [location, setLocation] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [availability] = useState('Available');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/users/setup/alumni', {
                full_name: fullName,
                current_company: currentCompany,
                current_position: currentPosition,
                department,
                graduation_year: graduationYear,
                bio,
                location,
                linkedin_url: linkedinUrl,
                availability,
                mentorship_expertise: expertise.split(',').map(s => s.trim()).filter(Boolean)
            });
            navigate('/alumni/home');
        } catch (err) {
            console.error("Error setting up alumni profile", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-3xl mx-auto flex flex-col gap-md">
                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <div className="flex flex-col border-b border-surface-container pb-xs">
                        <h1 className="text-xl font-bold font-display-bold text-on-surface">Complete Alumni Mentor Profile</h1>
                        <p className="text-xs text-on-surface-variant">Provide your professional credentials and mentorship preferences for student discovery.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Full Name *</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Current Company / Organization *</label>
                                <input
                                    type="text"
                                    value={currentCompany}
                                    onChange={(e) => setCurrentCompany(e.target.value)}
                                    required
                                    placeholder="e.g. Google, TechCorp, InnovateX"
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Current Role / Position *</label>
                                <input
                                    type="text"
                                    value={currentPosition}
                                    onChange={(e) => setCurrentPosition(e.target.value)}
                                    required
                                    placeholder="e.g. Senior Software Engineer"
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Department / Major Graduated From</label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Graduation / Batch Year</label>
                                <input
                                    type="number"
                                    value={graduationYear}
                                    onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2018)}
                                    required
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Location (Optional)</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">LinkedIn Profile URL (Optional)</label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Skills & Mentorship Expertise (Comma separated)</label>
                            <input
                                type="text"
                                value={expertise}
                                onChange={(e) => setExpertise(e.target.value)}
                                placeholder="Software Engineering, System Design, Career Growth, Interview Prep"
                                className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Professional Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                placeholder="Share your career journey, expertise, and how you can guide students..."
                                className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-xs border-t border-surface-container">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-lg py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all shadow-xs"
                            >
                                {saving ? 'Saving Profile...' : 'Complete Mentor Setup'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
};

export default AlumniProfileSetup;
