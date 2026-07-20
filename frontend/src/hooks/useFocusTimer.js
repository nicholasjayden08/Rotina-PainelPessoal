import { useEffect, useRef, useState } from 'react';

export function useFocusTimer(initialMinutes, onFinish) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [running, setRunning] = useState(false);

    const onFinishRef = useRef(onFinish);
    const finishedRef = useRef(false);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        finishedRef.current = false;
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {

                if (prev <= 1) {

                    if (!finishedRef.current) {
                        finishedRef.current = true;
                        setRunning(false);
                        onFinishRef.current?.();
                    }

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [running]);

    function start() {
        if (timeLeft <= 0) return;
        finishedRef.current = false;
        setRunning(true);
    }

    function pause() {
        setRunning(false);
    }

    function reset() {
        finishedRef.current = false;
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