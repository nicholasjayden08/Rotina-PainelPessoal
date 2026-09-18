/**
 * Detecta marcos de streak batidos (5, 10, 15, 30... dias definidos em
 * STREAK_MARCOS) e enfileira toasts motivacionais.
 *
 * Roda só uma vez por carregamento da página (jaProcessado ref) e usa
 * localStorage pra lembrar quais marcos já foram exibidos, então o
 * mesmo toast não repete a cada refresh — só quando um NOVO marco é
 * atingido.
 */

import { useEffect, useState, useRef } from 'react';
import { computeHabitStreaks } from '../utils/streak';
import { HABITOS_STREAK, STREAK_MARCOS } from '../constants';

const STORAGE_KEY = 'routinely_marcos_streak_exibidos';

function carregarExibidos() {
    try {
        return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
        return new Set();
    }
}

function salvarExibidos(set) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {
        // localStorage indisponível (modo privado etc) — apenas não persiste, sem quebrar o app
    }
}

// Detecta, uma vez por carregamento, se algum hábito bateu um marco de streak
// (5, 10, 15, 30... dias) e enfileira um aviso motivacional pra exibir em toast.
// Cada marco só é mostrado uma vez (controlado via localStorage).
export function useStreakToasts(historico) {
    const [fila, setFila] = useState([]);
    const jaProcessado = useRef(false);

    useEffect(() => {
        if (!historico || historico.length === 0) return;
        if (jaProcessado.current) return;
        jaProcessado.current = true;

        const streaks = computeHabitStreaks(historico);
        const exibidos = carregarExibidos();
        const novos = [];

        HABITOS_STREAK.forEach(({ campo, label }) => {
            const dias = streaks[campo];
            if (STREAK_MARCOS.includes(dias)) {
                const chave = `${campo}:${dias}`;
                if (!exibidos.has(chave)) {
                    novos.push({ id: chave, texto: `você está numa streak de ${dias} dias ${label}` });
                    exibidos.add(chave);
                }
            }
        });

        if (novos.length > 0) {
            salvarExibidos(exibidos);
            setFila(novos);
        }
    }, [historico]);

    function dispensar(id) {
        setFila((prev) => prev.filter((t) => t.id !== id));
    }

    return { toasts: fila, dispensar };
}