import { useEffect, useState } from 'react';

export function useFocusTimer(initialMinutes) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [running]);

    function start() {
        setRunning(true);
    }

    function pause() {
        setRunning(false);
    }

    function reset() {
        setRunning(false);
        setTimeLeft(initialMinutes * 60);
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return {
        minutes,
        seconds,
        running,
        start,
        pause,
        reset,
    };
}