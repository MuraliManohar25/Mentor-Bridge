/**
 * API Client with JWT Authentication
 * 
 * Axios instance configured with:
 * - Base URL pointing to backend
 * - Request interceptor: Auto-attach JWT from localStorage
 * - Response interceptor: Handle 401 errors (redirect to login)
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        }

        // Handle 500 Internal Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Error handling utility
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.detail || error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};
