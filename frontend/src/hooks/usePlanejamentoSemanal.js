/**
 * Planejamento semanal: carrega a semana atual + histórico em paralelo
 * (Promise.all). criar/atualizarRascunho/fechar/reabrir/concluirItem
 * operam sobre o planejamento atual e atualizam o estado local direto
 * com a resposta do backend (sem recarregar tudo).
 */

import { useState, useEffect, useCallback } from 'react';
import { planejamentosApi } from '../api/planejamentos';

export function usePlanejamentoSemanal() {
    const [planejamento, setPlanejamento] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [atual, hist] = await Promise.all([
                planejamentosApi.semanaAtual(),
                planejamentosApi.historico(),
            ]);
            setPlanejamento(atual);
            setHistorico(hist);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function criar(textoBruto) {
        const novo = await planejamentosApi.criar({ textoBruto });
        setPlanejamento(novo);
        return novo;
    }

    async function atualizarRascunho(id, textoBruto) {
        const atualizado = await planejamentosApi.atualizar(id, { textoBruto });
        setPlanejamento(atualizado);
        return atualizado;
    }

    async function fechar(id) {
        const fechado = await planejamentosApi.fechar(id);
        setPlanejamento(fechado);
        return fechado;
    }

    async function reabrir(id) {
        const reaberto = await planejamentosApi.reabrir(id);
        setPlanejamento(reaberto);
        return reaberto;
    }

    async function concluirItem(itemId) {
        const item = await planejamentosApi.concluirItem(itemId);
        setPlanejamento((prev) => {
            if (!prev) return prev;
            return { ...prev, itens: prev.itens.map((i) => (i.id === itemId ? item : i)) };
        });
        return item;
    }

    return { planejamento, historico, loading, error, criar, atualizarRascunho, fechar, reabrir, concluirItem };
}