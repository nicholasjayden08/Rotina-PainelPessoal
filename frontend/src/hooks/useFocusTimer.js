/**
 * Motor do cronômetro de foco (contagem regressiva).
 *
 * Em vez de decrementar um contador a cada tick, guarda o horário de
 * término (endTimeRef) e recalcula timeLeft a partir de Date.now() —
 * assim o timer não atrasa/desincroniza se a aba ficar em background
 * (setInterval é pausado pelo navegador). O listener de
 * visibilitychange força um recálculo assim que a aba volta ao foco.
 *
 * finishedRef evita disparar onFinish mais de uma vez.
 */

import { useEffect, useRef, useState } from 'react';

export function useFocusTimer(initialMinutes, onFinish) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [running, setRunning] = useState(false);

    const onFinishRef = useRef(onFinish);
    const finishedRef = useRef(false);
    const endTimeRef = useRef(null);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        finishedRef.current = false;
        endTimeRef.current = null;
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    useEffect(() => {
        if (!running) return;

        function tick() {
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(secondsLeft);

            if (secondsLeft <= 0 && !finishedRef.current) {
                finishedRef.current = true;
                setRunning(false);
                onFinishRef.current?.();
            }
        }

        tick();

        const interval = setInterval(tick, 1000);

        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') tick();
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [running]);

    function start() {
        if (timeLeft <= 0) return;
        finishedRef.current = false;
        endTimeRef.current = Date.now() + timeLeft * 1000;
        setRunning(true);
    }

    function pause() {
        setRunning(false);
    }

    function reset() {
        finishedRef.current = false;
        endTimeRef.current = null;
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