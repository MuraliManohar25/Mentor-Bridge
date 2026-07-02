import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient, { getErrorMessage } from '../services/api';
import { getDashboardPath } from '../components/ProtectedRoute';

export type UserRole = 'admin' | 'alumni' | 'student';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    profile?: {
        bio?: string;
        department?: string;
        graduation_year?: number;
        is_mentor?: boolean;
        current_company?: string;
        current_position?: string;
        mentorship_expertise?: string[];
    };
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    graduation_year?: number;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean, role?: UserRole) => Promise<User>;
    register: (data: RegisterData) => Promise<User>;
    logout: () => Promise<void>;
    isAdmin: () => boolean;
    isAlumni: () => boolean;
    isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                try {
                    const response = await apiClient.get('/auth/me');
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const persistSession = (accessToken: string, userData: User, rememberMe = true) => {
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('access_token', accessToken);
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('user');
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('user');
        }
    };

    const register = async (data: RegisterData): Promise<User> => {
        try {
            const response = await apiClient.post('/auth/register', data);
            const { access_token, user: userData } = response.data;
            persistSession(access_token, userData);
            return userData;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };

    const login = async (
        email: string,
        password: string,
        rememberMe = true,
        role: UserRole = 'student'
    ): Promise<User> => {
        try {
            const response = await apiClient.post('/auth/login', { email, password, role });
            const { access_token, user: userData } = response.data;
            persistSession(access_token, userData, rememberMe);
            return userData;
        } catch (error) {
            throw new Error(getErrorMessage(error) || 'Invalid email or password. Please try again.');
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
        }
    };

    const isAdmin = () => user?.role === 'admin';
    const isAlumni = () => user?.role === 'alumni';
    const isStudent = () => user?.role === 'student';

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAlumni,
        isStudent,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { getDashboardPath };
