import React, { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

export const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSaveAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await apiClient.put('/users/profile', {
                full_name: fullName,
                phone: phone
            });
            setMessage('Account settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setMessage(err.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-3xl mx-auto flex flex-col gap-md">
                <div className="flex flex-col border-b border-surface-container-high/40 pb-sm">
                    <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px]">settings</span>
                        Account Settings
                    </h1>
                    <p className="text-sm text-on-surface-variant">Manage your account information, notification preferences, and privacy.</p>
                </div>

                {message && (
                    <div className="p-sm bg-surface-container text-on-surface text-xs font-bold rounded-lg border border-surface-container-high">
                        {message}
                    </div>
                )}

                <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                    <h3 className="font-bold text-sm text-on-surface border-b border-surface-container pb-xs">
                        Personal Information
                    </h3>

                    <form onSubmit={handleSaveAccount} className="flex flex-col gap-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Email Address (Read-only)</label>
                                <input
                                    type="email"
                                    readOnly
                                    value={user?.email || ''}
                                    className="w-full p-2.5 bg-surface-container-low/50 text-xs rounded-lg border border-surface-container text-outline"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Role</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={user?.role?.toUpperCase() || ''}
                                    className="w-full p-2.5 bg-surface-container-low/50 text-xs rounded-lg border border-surface-container text-outline font-bold"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full p-2.5 bg-surface-container-low text-xs rounded-lg border border-surface-container text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-xs border-t border-surface-container">
                            <button
                                type="button"
                                onClick={logout}
                                className="px-md py-2 text-xs font-bold text-error hover:bg-error-container/20 rounded-lg transition-colors"
                            >
                                Log Out of Account
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-lg py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors shadow-xs"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
};

export default SettingsPage;
