import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { AppShell } from '../components/AppShell';

export const StudentProfileSetup: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [department, setDepartment] = useState(user?.profile?.department || 'Computer Science');
    const [graduationYear, setGraduationYear] = useState<number>(user?.profile?.graduation_year || 2025);
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [interests, setInterests] = useState(user?.profile?.interests?.join(', ') || 'Software Engineering, AI, Cloud');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/users/setup/student', {
                full_name: fullName,
                department,
                graduation_year: graduationYear,
                bio,
                interests: interests.split(',').map((s: string) => s.trim()).filter(Boolean)
            });
            navigate('/student/home');
        } catch (err) {
            console.error("Error setting up student profile", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-2xl mx-auto flex flex-col gap-md">
                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <div className="flex flex-col border-b border-surface-container pb-xs">
                        <h1 className="text-xl font-bold font-display-bold text-on-surface">Complete Student Profile</h1>
                        <p className="text-xs text-on-surface-variant">Set up your academic details and interests so mentors can get to know you.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Full Name</label>
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
                                <label className="text-xs font-bold text-on-surface">Department / Major</label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Expected Graduation Year</label>
                                <input
                                    type="number"
                                    value={graduationYear}
                                    onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2025)}
                                    required
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Interests & Specializations (Comma separated)</label>
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="Software Engineering, Distributed Systems, Machine Learning"
                                className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-on-surface">Bio / Career Goal</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                placeholder="Tell alumni mentors about your background and what guidance you are seeking..."
                                className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-xs border-t border-surface-container">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-lg py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all shadow-xs"
                            >
                                {saving ? 'Saving Profile...' : 'Complete Profile Setup'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
};

export default StudentProfileSetup;
