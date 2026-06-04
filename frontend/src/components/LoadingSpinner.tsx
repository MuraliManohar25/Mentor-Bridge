import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullPage?: boolean;
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    fullPage = false,
    message
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
            {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
