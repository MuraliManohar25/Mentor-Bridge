import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Users,
    Briefcase,
    Calendar,
    MessageCircle,
    Bell,
    Settings,
    LogOut,
    Menu,
    GraduationCap,
    ChevronDown,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'student' | 'alumni' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const studentLinks = [
        { name: 'Dashboard', icon: Home, path: '/student' },
        { name: 'Alumni Directory', icon: Users, path: '/student/alumni' },
        { name: 'Career Events', icon: Calendar, path: '/student/events' },
        { name: 'Job Opportunities', icon: Briefcase, path: '/student/jobs' },
        { name: 'Find Mentor', icon: GraduationCap, path: '/student/mentors' },
        { name: 'Messages', icon: MessageCircle, path: '/student/messages' },
    ];

    const alumniLinks = [
        { name: 'Dashboard', icon: Home, path: '/alumni' },
        { name: 'Alumni Network', icon: Users, path: '/alumni/network' },
        { name: 'Post Job', icon: Briefcase, path: '/alumni/post-job' },
        { name: 'My Job Posts', icon: Briefcase, path: '/alumni/jobs' },
        { name: 'Schedule Event', icon: Calendar, path: '/alumni/schedule-event' },
        { name: 'My Events', icon: Calendar, path: '/alumni/events' },
        { name: 'Messages', icon: MessageCircle, path: '/alumni/messages' },
    ];

    const adminLinks = [
        { name: 'Dashboard', icon: Home, path: '/admin' },
        { name: 'User Management', icon: Users, path: '/admin/users' },
        { name: 'Event Management', icon: Calendar, path: '/admin/events' },
        { name: 'Job Management', icon: Briefcase, path: '/admin/jobs' },
        { name: 'Analytics', icon: Settings, path: '/admin/analytics' },
    ];

    const links = role === 'student' ? studentLinks : role === 'alumni' ? alumniLinks : adminLinks;

    const notifications = [
        { id: 1, title: 'New mentor request', time: '5 min ago', unread: true },
        { id: 2, title: 'Upcoming event reminder', time: '1 hour ago', unread: true },
        { id: 3, title: 'Job application received', time: '2 hours ago', unread: false },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
                    sidebarOpen ? 'w-64' : 'w-20'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        {sidebarOpen && (
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                                    <GraduationCap className="text-white" size={24} />
                                </div>
                                <span className="font-bold text-xl text-text-dark">GradConnect</span>
                            </Link>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-primary/10 transition-colors group"
                            >
                                <link.icon
                                    size={20}
                                    className="text-gray-600 group-hover:text-primary transition-colors"
                                />
                                {sidebarOpen && (
                                    <span className="text-gray-700 group-hover:text-primary transition-colors">
                                        {link.name}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-gray-200 p-4">
                        {sidebarOpen ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {user?.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text-dark truncate">
                                        {user?.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-sm">
                                    {user?.full_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${
                    sidebarOpen ? 'ml-64' : 'ml-20'
                }`}
            >
                {/* Top Navigation Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Bell size={20} className="text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                <AnimatePresence>
                                    {notificationsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-text-dark">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                            notif.unread ? 'bg-primary/5' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {notif.unread && (
                                                                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-text-dark">
                                                                    {notif.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {notif.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 text-center border-t border-gray-200">
                                                <button className="text-sm text-primary font-medium hover:underline">
                                                    View all notifications
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Messages */}
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MessageCircle size={20} className="text-gray-600" />
                            </button>

                            {/* Profile Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                            {user?.full_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-600" />
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings size={18} className="text-gray-600" />
                                                <span className="text-sm text-gray-700">Settings</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                                            >
                                                <LogOut size={18} className="text-red-500" />
                                                <span className="text-sm text-red-500">Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
