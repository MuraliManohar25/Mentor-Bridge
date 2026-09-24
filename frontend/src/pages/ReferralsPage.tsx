import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { referralService, ReferralLinkData } from '../services/referralService';

export const ReferralsPage: React.FC = () => {
    const [referralData, setReferralData] = useState<ReferralLinkData | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReferral = async () => {
            setLoading(true);
            try {
                const data = await referralService.getMyReferralLink();
                setReferralData(data);
            } catch (err) {
                console.error("Failed to load referral data", err);
            } finally {
                setLoading(false);
            }
        };

        loadReferral();
    }, []);

    const handleCopy = () => {
        if (referralData?.referral_url) {
            navigator.clipboard.writeText(referralData.referral_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setSending(true);
        try {
            await referralService.sendInvite(inviteEmail.trim());
            setInviteEmail('');
            setSendSuccess(true);
            setTimeout(() => setSendSuccess(false), 3000);
            const fresh = await referralService.getMyReferralLink();
            setReferralData(fresh);
        } catch (err) {
            console.error("Error sending invite", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-4xl mx-auto flex flex-col gap-md">
                <div className="flex flex-col border-b border-surface-container-high/40 pb-sm">
                    <h1 className="text-2xl font-bold font-display-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[28px]">person_add</span>
                        Alumni Referral System
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Invite fellow alumni to join Mentor Bridge and expand mentorship support for current students.
                    </p>
                </div>

                {loading ? (
                    <div className="h-48 bg-surface-container-low rounded-xl animate-pulse"></div>
                ) : (
                    <>
                        {/* Referral Stats Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col">
                                <span className="text-xs text-on-surface-variant">Total Invites Sent</span>
                                <span className="text-2xl font-bold text-on-surface mt-1">{referralData?.total_invites || 0}</span>
                            </div>
                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col">
                                <span className="text-xs text-on-surface-variant">Successful Joins</span>
                                <span className="text-2xl font-bold text-emerald-600 mt-1">{referralData?.successful_joins || 0}</span>
                            </div>
                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col">
                                <span className="text-xs text-on-surface-variant">Points Earned</span>
                                <span className="text-2xl font-bold text-primary mt-1">{referralData?.points_earned || 0} pts</span>
                            </div>
                        </div>

                        {/* Unique Link Card */}
                        <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">link</span>
                                Your Unique Alumni Invitation Link
                            </h3>

                            <div className="flex items-center gap-sm bg-surface-container-low p-2 rounded-xl border border-surface-container">
                                <input
                                    type="text"
                                    readOnly
                                    value={referralData?.referral_url || ''}
                                    className="flex-1 bg-transparent text-xs font-mono text-on-surface px-2 focus:outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="px-md py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-colors shrink-0"
                                >
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                        {/* Direct Email Invite */}
                        <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-md">
                            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[18px]">mail</span>
                                Invite Alumni via Email
                            </h3>

                            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-sm items-center">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter alumni colleague's email address..."
                                    required
                                    className="flex-1 w-full p-2.5 bg-surface-container-low text-xs rounded-xl focus:outline-none focus:bg-surface-container text-on-surface border border-surface-container"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !inviteEmail.trim()}
                                    className="w-full sm:w-auto px-lg py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xs shrink-0"
                                >
                                    {sending ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </form>

                            {sendSuccess && (
                                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Invitation sent successfully!
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
};

export default ReferralsPage;
