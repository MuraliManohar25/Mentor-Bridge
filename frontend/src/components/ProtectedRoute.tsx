import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const getDashboardPath = (role: UserRole): string => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'alumni':
            return '/alumni/dashboard';
        default:
            return '/student/dashboard';
    }
};

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getDashboardPath(user.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
