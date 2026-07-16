import { useEffect, useRef , useState } from 'react';

export function useFocusTimer(initialMinutes, onFinish) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [running, setRunning] = useState(false);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    onFinishRef.current?.();
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