import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute, { getDashboardPath } from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import StudentProfileSetup from './pages/StudentProfileSetup';
import AlumniProfileSetup from './pages/AlumniProfileSetup';

import StudentHome from './pages/StudentHome';
import AlumniHome from './pages/AlumniHome';
import AdminDashboard from './pages/admin/Dashboard';

import AlumniDirectory from './pages/AlumniDirectory';
import MentorProfile from './pages/MentorProfile';

import CirclesList from './pages/CirclesList';
import CircleDetail from './pages/CircleDetail';
import CreateCircle from './pages/CreateCircle';

import MentorFeed from './pages/MentorFeed';
import CreatePost from './pages/CreatePost';
import SinglePostView from './pages/SinglePostView';

import StudentBoardPage from './pages/StudentBoardPage';
import DirectMessages from './pages/DirectMessages';
import NotificationsPage from './pages/NotificationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ReferralsPage from './pages/ReferralsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient();

const AuthRedirect: React.FC = () => {
    const { user, loading, isAuthenticated } = useAuth();
    if (loading) return null;
    if (isAuthenticated && user) {
        return <Navigate to={getDashboardPath(user.role)} replace />;
    }
    return <Navigate to="/login" replace />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Onboarding & Setup */}
                        <Route
                            path="/role-selection"
                            element={
                                <ProtectedRoute>
                                    <RoleSelectionPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/profile-setup"
                            element={
                                <ProtectedRoute allowedRoles={['student']}>
                                    <StudentProfileSetup />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/alumni/profile-setup"
                            element={
                                <ProtectedRoute allowedRoles={['alumni']}>
                                    <AlumniProfileSetup />
                                </ProtectedRoute>
                            }
                        />

                        {/* Student Routes */}
                        <Route
                            path="/student/home"
                            element={
                                <ProtectedRoute allowedRoles={['student']}>
                                    <StudentHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/student/dashboard" element={<Navigate to="/student/home" replace />} />

                        {/* Alumni Routes */}
                        <Route
                            path="/alumni/home"
                            element={
                                <ProtectedRoute allowedRoles={['alumni']}>
                                    <AlumniHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/alumni/dashboard" element={<Navigate to="/alumni/home" replace />} />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Core Mentorship & Directory */}
                        <Route
                            path="/mentors"
                            element={
                                <ProtectedRoute>
                                    <AlumniDirectory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mentors/:mentorId"
                            element={
                                <ProtectedRoute>
                                    <MentorProfile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Community Circles */}
                        <Route
                            path="/circles"
                            element={
                                <ProtectedRoute>
                                    <CirclesList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/circles/create"
                            element={
                                <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                                    <CreateCircle />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/circles/:circleId"
                            element={
                                <ProtectedRoute>
                                    <CircleDetail />
                                </ProtectedRoute>
                            }
                        />

                        {/* Mentor Feed & Posts */}
                        <Route
                            path="/feed"
                            element={
                                <ProtectedRoute>
                                    <MentorFeed />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/posts/create"
                            element={
                                <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                                    <CreatePost />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/posts/:postId"
                            element={
                                <ProtectedRoute>
                                    <SinglePostView />
                                </ProtectedRoute>
                            }
                        />

                        {/* Student Q&A Board */}
                        <Route
                            path="/student-board"
                            element={
                                <ProtectedRoute>
                                    <StudentBoardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Direct Messages */}
                        <Route
                            path="/messages"
                            element={
                                <ProtectedRoute>
                                    <DirectMessages />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/messages/:conversationId"
                            element={
                                <ProtectedRoute>
                                    <DirectMessages />
                                </ProtectedRoute>
                            }
                        />

                        {/* Engagement & Recognition */}
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/leaderboard"
                            element={
                                <ProtectedRoute>
                                    <LeaderboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/referrals"
                            element={
                                <ProtectedRoute>
                                    <ReferralsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirects */}
                        <Route path="/student" element={<Navigate to="/student/home" replace />} />
                        <Route path="/alumni" element={<Navigate to="/alumni/home" replace />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                        <Route path="*" element={<AuthRedirect />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
