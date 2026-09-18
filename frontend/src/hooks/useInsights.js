/**
 * Busca os insights automáticos do mês (ano, mes). dadosSuficientes
 * indica se já tem histórico o bastante pro backend gerar insight —
 * a UI usa isso pra mostrar um aviso em vez de lista vazia.
 */

import { useState, useEffect, useCallback } from 'react';
import { insightsApi } from '../api/insights';

export function useInsights(ano, mes) {

    const [insights, setInsights] = useState([]);
    const [dadosSuficientes, setDadosSuficientes] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {

        if (!ano || !mes) return;

        setLoading(true);
        setError(null);

        try {
            const dados = await insightsApi.buscarInsights(ano, mes);
            setInsights(dados.insights || []);
            setDadosSuficientes(dados.dadosSuficientes);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }

    }, [ano, mes]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return {
        insights,
        dadosSuficientes,
        loading,
        error,
        recarregar: carregar,
    };
}