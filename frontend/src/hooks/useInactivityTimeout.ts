import { useEffect, useRef } from 'react';

const ACIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
const DEFAULT_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useInactivityTimeout = (onTimeout: () => void, timeoutMs: number = DEFAULT_TIMEOUT) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(onTimeout, timeoutMs);
    };

    useEffect(() => {
        // Initialize timer
        resetTimer();

        // Add event listeners
        const handleActivity = () => resetTimer();
        ACIVITY_EVENTS.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            ACIVITY_EVENTS.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [onTimeout, timeoutMs]);
};
