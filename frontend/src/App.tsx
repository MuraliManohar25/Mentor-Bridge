import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { getDashboardPath } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';

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
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route
                            path="/student/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['student']}>
                                    <StudentDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/alumni/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['alumni']}>
                                    <AlumniDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                        <Route path="/alumni" element={<Navigate to="/alumni/dashboard" replace />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                        <Route path="*" element={<AuthRedirect />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
