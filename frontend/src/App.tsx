import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import LandingPage from './pages/LandingPage'; // Updated import

const queryClient = new QueryClient();

// Protected Route Component - Dummy mode (no authentication check)
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    // For demo/presentation mode - just render the children without authentication
    return <>{children}</>;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} /> {/* Using LandingPage */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Dashboard Routes - No authentication for demo */}
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
