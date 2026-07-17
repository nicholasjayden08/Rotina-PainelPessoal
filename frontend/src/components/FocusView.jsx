import { useEffect, useRef, useState } from 'react';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { FocusHistoryTable } from './FocusHistoryTable';
import { LoadingBlock, ErrorBlock } from './Shared';

function tocarBeep(ctx) {
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume();
        [0, 0.25, 0.5].forEach((t) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + 0.2);
        });
    } catch {
        // navegador sem suporte a Web Audio, ignora
    }
}

function notificarFimDoFoco(titulo) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification('Sessão de foco concluída', {
        body: titulo || 'Sua sessão de foco terminou.',
        icon: '/favicon.svg',
    });
}

export function FocusView({ sessions, loading, error, criarSessao, excluirSessao }) {
    const [focusTime, setFocusTime] = useState(25);
    const [focusTitle, setFocusTitle] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [immersiveMode, setImmersiveMode] = useState(false);
    const audioCtxRef = useRef(null);


    function handleFocusFinish() {

        tocarBeep(audioCtxRef.current);
        notificarFimDoFoco(focusTitle);

        const duracaoArredondada = Math.max(1, Math.round(focusTime));

        criarSessao({
            titulo: focusTitle,
            duracaoMinutos: duracaoArredondada
        }).catch(() => {});
    }

    const {
        minutes,
        seconds,
        running,
        start,
        pause,
        reset
    } = useFocusTimer(focusTime, handleFocusFinish);

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setImmersiveMode(false);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    function handleStart() {
        setSessionActive(true);
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        start();
    }

    function handleFinish() {
        setSessionActive(false);
        reset();
    }

    function handleTimeChange(e) {
        setFocusTime(Number(e.target.value));
        reset();
    }

    if (immersiveMode) {
        return (
            <div className="focus-immersive">

                <div className="immersive-content">

                    <div className="focus-timer">
                        {String(minutes).padStart(2, '0')}:
                        {String(seconds).padStart(2, '0')}
                    </div>

                    <h2> { focusTitle || 'Sessão de foco' } </h2>

                    <span> foco ativo </span>

                    <button  className="secondary-btn"  onClick={() => setImmersiveMode(false)} > sair </button>
                </div>

            </div>
        );
    }

    return (
        <div className="view-wrap fade-in">

            <header className="page-header page-header-responsive">
                <div>
                    <p className="eyebrow">concentração</p>
                    <h1 className="page-title">foco</h1>
                </div>
            </header>

            <section className="panel">
                {!sessionActive ? (
                    <div className="focus-container">
                        <div className="focus-config">
                            <label>
                                Objetivo da sessão
                            </label>
                            <input
                                type="text"
                                placeholder="Ex.: Estudar Java"
                                className="input"
                                value={focusTitle}
                                onChange={(e) => setFocusTitle(e.target.value)}
                            />
                            <label>
                                Duração da sessão
                            </label>

                            <select
                                className="input"
                                value={focusTime}
                                onChange={handleTimeChange}
                            >
                                <option value={15}>15 minutos</option>
                                <option value={25}>25 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>60 minutos</option>
                                <option value={90}>90 minutos</option>
                            </select>

                        </div>
                        <div className="focus-timer">

                            {String(minutes).padStart(2, '0')}
                            :
                            {String(seconds).padStart(2, '0')}

                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleStart}
                        >
                            Iniciar sessão
                        </button>
                    </div>
                ) : (
                    <div className="focus-container">

                        <p className="eyebrow"> foco ativo </p>

                        <div className="focus-timer">
                            {String(minutes).padStart(2, '0')}
                            :
                            {String(seconds).padStart(2, '0')}
                        </div>

                        <h2 className="panel-title">
                            {focusTitle || 'Sessão de foco'}
                        </h2>

                        <div className="focus-actions">
                            {running ? (
                                <button
                                    className="secondary-btn"
                                    onClick={pause}
                                >
                                    Pausar
                                </button>
                            ) : (
                                <button
                                    className="primary-btn"
                                    onClick={start}
                                >
                                    Continuar
                                </button>
                            )}
                            <button
                                className="secondary-btn"
                                onClick={handleFinish}
                            >
                                Finalizar
                            </button>

                            <button
                                className="secondary-btn"
                                onClick={() => setImmersiveMode(true)}
                            >
                                modo imersão
                            </button>
                        </div>
                    </div>

                )}
            </section>

            <section className="panel" style={{ marginTop: '1.25rem' }}>
                <div className="panel-header">
                    <h2 className="panel-title">histórico de sessões</h2>
                </div>
                <ErrorBlock text={error} />
                {loading ? (
                    <LoadingBlock text="carregando sessões..." />
                ) : (
                    <FocusHistoryTable sessions={sessions} onDelete={excluirSessao} />
                )}
            </section>
        </div>
    );
}