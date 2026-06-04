import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:8888/api';

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Enable cookies for refresh token
});

// User role types matching backend
export type UserRole = 'admin' | 'alumni' | 'student';

// User interface
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
    };
}

// Registration data
export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    graduation_year?: number;
    department?: string;
}

// Auth context type
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean, role?: UserRole) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
    isAlumni: () => boolean;
    isStudent: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Setup axios interceptor for automatic token attachment
    useEffect(() => {
        const requestInterceptor = apiClient.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            apiClient.interceptors.request.eject(requestInterceptor);
        };
    }, [token]);

    // Setup axios interceptor for 401 errors and token refresh
    useEffect(() => {
        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                // If 401 error and we haven't tried to refresh yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    if (isRefreshing) {
                        // Wait for refresh to complete
                        return new Promise((resolve) => {
                            const interval = setInterval(() => {
                                if (!isRefreshing) {
                                    clearInterval(interval);
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                    resolve(apiClient(originalRequest));
                                }
                            }, 100);
                        });
                    }

                    try {
                        setIsRefreshing(true);
                        // Try to refresh the token using the refresh token in httpOnly cookie
                        const response = await apiClient.post('/auth/refresh');
                        const { access_token } = response.data;

                        // Update token
                        setToken(access_token);
                        localStorage.setItem('access_token', access_token);

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        return apiClient(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        logout();
                        return Promise.reject(refreshError);
                    } finally {
                        setIsRefreshing(false);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [token, isRefreshing]);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = async (data: RegisterData) => {
        try {
            const response = await apiClient.post('/auth/register', data);
            const { access_token, user: userData } = response.data;

            // Save to state and localStorage
            setToken(access_token);
            setUser(userData);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Role-based redirect after registration
            window.location.href = userData.role === 'admin' ? '/admin' : userData.role === 'alumni' ? '/alumni' : '/student';
        } catch (error: any) {
            // Generic error message for security (anti-enumeration)
            throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
        }
    };

    const login = async (email: string, password: string, rememberMe: boolean = false, role?: UserRole) => {
        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
                role: role || 'student', // Default to student if not provided
            });

            const { access_token, user: userData } = response.data;

            // Save to state
            setToken(access_token);
            setUser(userData);
            
            // Save to localStorage only if "Remember Me" is checked
            if (rememberMe) {
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user', JSON.stringify(userData));
            }

            // Role-based redirect after login
            window.location.href = userData.role === 'admin' ? '/admin' : userData.role === 'alumni' ? '/alumni' : '/student';
        } catch (error: any) {
            // Generic error message for security (anti-enumeration)
            throw new Error('Invalid email or password. Please try again.');
        }
    };

    const logout = async () => {
        try {
            // Call backend to clear refresh token cookie
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    const isAdmin = () => user?.role === 'admin';
    const isAlumni = () => user?.role === 'alumni';
    const isStudent = () => user?.role === 'student';

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user,
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

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
