/**
 * Custom hook for managing toast notifications
 */
import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
    };
};

export default useToast;
