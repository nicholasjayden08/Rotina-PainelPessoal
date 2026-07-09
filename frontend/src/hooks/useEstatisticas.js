import { useState, useEffect, useCallback } from 'react';
import { estatisticasApi } from '../api/estatisticas';

export function useMesesEstatisticas() {
    const [meses, setMeses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const dados = await estatisticasApi.buscarMeses();
            setMeses(dados);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return {
        meses,
        loading,
        error,
        recarregar: carregar,
    };
}

export function useResumoEstatisticas(ano, mes) {

    const [resumo, setResumo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {

        if (!ano || !mes) return;

        setLoading(true);
        setError(null);

        try {
            const dados = await estatisticasApi.buscarEstatisticas(ano, mes);
            setResumo(dados);
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
        resumo,
        loading,
        error,
        recarregar: carregar,
    };
}