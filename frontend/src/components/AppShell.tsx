import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const { user, logout, isStudent, isAlumni } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/mentors?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const dashboardPath = isStudent() ? '/student/home' : isAlumni() ? '/alumni/home' : '/admin/dashboard';

    const navLinks = [
        { path: dashboardPath, label: 'Home', icon: 'home' },
        { path: '/mentors', label: 'Directory', icon: 'badge' },
        { path: '/circles', label: 'Circles', icon: 'group_work' },
        { path: '/feed', label: 'Feed', icon: 'feed' },
        { path: '/student-board', label: 'Student Board', icon: 'help_center' },
        { path: '/messages', label: 'Messages', icon: 'chat_bubble' },
        { path: '/notifications', label: 'Notifications', icon: 'notifications' },
        { path: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
        { path: '/referrals', label: 'Referrals', icon: 'person_add' },
        { path: '/settings', label: 'Settings', icon: 'settings' },
    ];

    const isActive = (path: string) => {
        if (path === '/student/home' || path === '/alumni/home') {
            return location.pathname === '/student/home' || location.pathname === '/alumni/home' || location.pathname === '/student/dashboard' || location.pathname === '/alumni/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high/40">
                <div className="flex flex-col">
                    {/* Brand Logo */}
                    <Link to={dashboardPath} className="h-16 flex items-center gap-xs px-md hover:opacity-90 transition-opacity">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                            <span className="material-symbols-outlined text-[22px]">hub</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display-bold text-display-bold text-primary tracking-tight text-lg leading-none font-bold">Mentor Bridge</span>
                            <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase mt-1">Campus Connection</span>
                        </div>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-base px-xs py-sm">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-sm px-md py-xs rounded-lg transition-colors text-sm font-medium ${
                                        active
                                            ? 'bg-surface-container text-on-surface font-label-bold font-semibold shadow-xs'
                                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${active ? 'text-primary' : 'text-outline'}`}>
                                        {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Logged in User Profile Footer */}
                <div className="p-sm m-xs bg-surface-container-low rounded-xl flex flex-col gap-xs border border-surface-container">
                    <div className="flex items-center gap-xs">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden text-on-primary">
                            {user?.profile?.avatar_url ? (
                                <img src={user.profile.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">person</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-label-bold text-sm text-on-surface truncate font-bold">{user?.full_name || 'User'}</span>
                            <span className="font-caption-regular text-xs text-on-surface-variant truncate">
                                {user?.profile?.department || user?.email}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-base border-t border-surface-container/60 mt-xs">
                        <span className="font-caption-medium text-xs text-on-surface-variant">Role</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded-full text-on-surface font-label-bold text-xs font-semibold uppercase tracking-wider">
                            <span className={`w-2 h-2 rounded-full ${isStudent() ? 'bg-secondary' : 'bg-emerald-500'}`}></span>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main Header */}
            <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 border-b border-surface-container-high/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <div className="w-full h-16 px-container-margin flex items-center justify-between gap-md">
                    {/* Mobile Logo */}
                    <Link to={dashboardPath} className="lg:hidden flex items-center gap-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                            <span className="material-symbols-outlined text-[20px]">hub</span>
                        </div>
                        <span className="font-display-bold text-primary font-bold text-base tracking-tight">Mentor Bridge</span>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
                        <div className="relative flex items-center w-full">
                            <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[20px] pointer-events-none">
                                search
                            </span>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mentors by name, company, or skills..."
                                className="w-full pl-10 pr-md py-1.5 bg-surface-container-low text-on-surface text-sm rounded-lg focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline"
                            />
                        </div>
                    </form>

                    {/* Header Actions */}
                    <div className="flex items-center gap-xs sm:gap-md">
                        <Link
                            to="/notifications"
                            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
                        </Link>

                        <Link
                            to="/student-board"
                            className="inline-flex items-center gap-xs px-3 py-1.5 bg-primary-container text-on-primary font-label-bold text-xs sm:text-sm font-semibold rounded-lg hover:bg-primary transition-colors shadow-xs"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span className="hidden xs:inline">Ask Question</span>
                        </Link>

                        {/* User Avatar & Menu Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden text-on-primary ring-2 ring-transparent hover:ring-primary/20 transition-all"
                            >
                                {user?.profile?.avatar_url ? (
                                    <img src={user.profile.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                )}
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2 border-b border-surface-container">
                                        <p className="font-bold text-sm text-on-surface truncate">{user?.full_name}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                                    </div>

                                    <Link
                                        to={isStudent() ? '/student/profile-setup' : '/alumni/profile-setup'}
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                        <span>Edit Profile</span>
                                    </Link>

                                    <Link
                                        to="/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">settings</span>
                                        <span>Settings</span>
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            logout();
                                        }}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors border-t border-surface-container mt-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Workspace Body */}
            <main className="lg:pl-64 pt-16 flex-1 bg-background min-h-screen pb-20 lg:pb-8">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-surface-container-high flex items-center justify-around z-50 px-xs shadow-lg">
                {[
                    { path: dashboardPath, label: 'Home', icon: 'home' },
                    { path: '/mentors', label: 'Directory', icon: 'badge' },
                    { path: '/circles', label: 'Circles', icon: 'group_work' },
                    { path: '/feed', label: 'Feed', icon: 'feed' },
                    { path: '/messages', label: 'Messages', icon: 'chat_bubble' },
                ].map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                                active ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-[22px] ${active ? 'text-primary' : 'text-outline'}`}>
                                {link.icon}
                            </span>
                            <span className="text-[10px]">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
