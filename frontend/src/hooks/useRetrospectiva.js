/**
 * Busca a retrospectiva de um ano (GET /retrospectiva?ano=). Recarrega
 * sozinho quando o ano muda.
 */

import { useState, useEffect, useCallback } from 'react';
import { retrospectivaApi } from '../api/retrospectiva';

export function useRetrospectiva(ano) {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            setDados(await retrospectivaApi.buscar(ano));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [ano]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return { dados, loading, error, recarregar: carregar };
}