import { useEffect, useState } from 'react';
import { useFocusTimer } from '../hooks/useFocusTimer';

export function FocusView() {
    const [focusTime, setFocusTime] = useState(25);
    const [focusTitle, setFocusTitle] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [immersiveMode, setImmersiveMode] = useState(false);

    const {
        minutes,
        seconds,
        running,
        start,
        pause,
        reset
    } = useFocusTimer(focusTime);

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
        </div>
    );
}