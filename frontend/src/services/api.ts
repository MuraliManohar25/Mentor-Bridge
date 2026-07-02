/**
 * API Client with JWT Authentication
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const resolveApiBase = (): string => {
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const trimmed = raw.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE = resolveApiBase();

const apiClient = axios.create({
    baseURL: API_BASE,
    // Render free tier cold starts can exceed 15s on first request
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isAuthRoute =
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/register');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    `${API_BASE}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    window.location.href = '/login';
                }
            }
        }

        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        
        // Handle FastAPI 422 validation errors (errors array format)
        if (Array.isArray(data?.errors)) {
            const firstError = data.errors[0];
            if (firstError?.loc && firstError?.msg) {
                const field = firstError.loc[firstError.loc.length - 1]; // Get the last element (field name)
                return `${field}: ${firstError.msg}`;
            }
            if (firstError?.msg) {
                return firstError.msg;
            }
        }
        
        // Handle string detail (400/403/404 etc.)
        const detail = data?.detail;
        if (typeof detail === 'string') return detail;
        
        return error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};
