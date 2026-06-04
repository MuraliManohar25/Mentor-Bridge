/**
 * Custom hook for debouncing values
 * 
 * Delays updating the value until after the specified delay
 * Useful for search inputs to avoid excessive API calls
 */
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
