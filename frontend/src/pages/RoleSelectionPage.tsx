import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    useAuth();

    const handleSelectRole = (role: 'student' | 'alumni') => {
        if (role === 'student') {
            navigate('/student/profile-setup');
        } else {
            navigate('/alumni/profile-setup');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
            <div className="max-w-xl w-full bg-surface-container-lowest rounded-2xl p-md md:p-xl shadow-lg border border-surface-container-high/40 flex flex-col gap-md text-center">
                <div className="flex flex-col items-center gap-xs">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm mb-xs">
                        <span className="material-symbols-outlined text-[28px]">hub</span>
                    </div>
                    <h1 className="text-2xl font-bold font-display-bold text-on-surface">Welcome to Mentor Bridge</h1>
                    <p className="text-xs text-on-surface-variant max-w-sm">
                        Select your platform role to personalize your mentorship experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mt-sm">
                    {/* Student Card */}
                    <button
                        onClick={() => handleSelectRole('student')}
                        className="p-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex flex-col items-center text-center gap-xs group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[28px]">school</span>
                        </div>
                        <span className="font-bold text-base text-on-surface">I am a Student</span>
                        <p className="text-xs text-on-surface-variant">
                            Find alumni mentors, ask career questions, and join community circles.
                        </p>
                    </button>

                    {/* Alumni Card */}
                    <button
                        onClick={() => handleSelectRole('alumni')}
                        className="p-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex flex-col items-center text-center gap-xs group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                        </div>
                        <span className="font-bold text-base text-on-surface">I am an Alumni</span>
                        <p className="text-xs text-on-surface-variant">
                            Guide current students, accept 1:1 requests, lead circles, and build impact.
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
