/**
 * Tela do timer de foco (Pomodoro-like), com modo imersão (fullscreen).
 *
 * tocarBeep() gera 3 bips via Web Audio API na hora que o timer zera
 * (sem depender de arquivo de áudio). notificarFimDoFoco() dispara uma
 * Notification do navegador se o usuário já deu permissão.
 *
 * O AudioContext só é criado no primeiro clique em "iniciar" (audioCtxRef)
 * porque navegadores bloqueiam criar/tocar áudio sem interação do usuário.
 *
 * immersiveMode entra em fullscreen real (requestFullscreen) e sai com
 * Esc ou saindo do fullscreen nativo — os 3 useEffects sincronizam esse
 * estado com a API de Fullscreen do navegador.
 */

import { useEffect, useRef, useState } from 'react';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { FocusHistoryTable } from './FocusHistoryTable';
import { CustomSelect } from './CustomSelect';
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

    useEffect(() => {
        if (immersiveMode) {
            document.documentElement.requestFullscreen?.().catch(() => {});
        } else if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
        }
    }, [immersiveMode]);

    useEffect(() => {
        function handleFullscreenChange() {
            if (!document.fullscreenElement) {
                setImmersiveMode(false);
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

    function handleTimeChange(valor) {
        setFocusTime(Number(valor));
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

                            <CustomSelect
                                value={focusTime}
                                onChange={handleTimeChange}
                                options={[
                                    { value: 15, label: '15 minutos' },
                                    { value: 25, label: '25 minutos' },
                                    { value: 45, label: '45 minutos' },
                                    { value: 60, label: '60 minutos' },
                                    { value: 90, label: '90 minutos' },
                                ]}
                            />

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