/**
 * API Client with JWT Authentication and Production Endpoint Resolution
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const resolveApiBase = (): string => {
    let raw = import.meta.env.VITE_API_URL;

    // Support manual override in browser localStorage for debugging live sites
    if (typeof window !== 'undefined') {
        const customUrl = localStorage.getItem('VITE_API_URL');
        if (customUrl) return customUrl.replace(/\/$/, '');
    }

    // Smart fallback for deployed production sites if VITE_API_URL was omitted at build time
    if (!raw && typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') {
            if (host.includes('onrender.com')) {
                if (host.includes('-web.')) {
                    raw = `https://${host.replace('-web.', '-api.')}`;
                } else if (host.includes('-frontend.')) {
                    raw = `https://${host.replace('-frontend.', '-api.')}`;
                } else if (host.includes('-ui.')) {
                    raw = `https://${host.replace('-ui.', '-api.')}`;
                } else {
                    const parts = host.split('.');
                    raw = `https://${parts[0]}-api.onrender.com`;
                }
            } else {
                raw = window.location.origin;
            }
        }
    }

    if (!raw) {
        raw = 'http://localhost:8000';
    }

    const trimmed = raw.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE = resolveApiBase();

const apiClient = axios.create({
    baseURL: API_BASE,
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
                const field = firstError.loc[firstError.loc.length - 1];
                return `${field}: ${firstError.msg}`;
            }
            if (firstError?.msg) {
                return firstError.msg;
            }
        }

        // Handle string detail (400/403/404 etc.)
        const detail = data?.detail;
        if (typeof detail === 'string') return detail;

        // No response received at all — genuine network/connectivity issue
        if (!error.response) {
            return `Unable to reach backend API at (${API_BASE}). If using free tier hosting (e.g. Render), the server may take 30 seconds to wake up from sleep. Please try again in a moment.`;
        }

        return error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};
