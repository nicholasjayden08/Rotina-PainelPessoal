/**
 * CRUD das sessões de foco (Focus Timer). Nada especial aqui além do
 * padrão do app: carrega na montagem, criar/excluir atualizam o estado
 * local sem precisar recarregar a lista inteira.
 */

import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

export function useFoco() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const carregar = useCallback(async () => {

        try {
            setLoading(true);
            const data = await api.get('/sessoes-foco');
            setSessions(data);
            setError('');
        }

        catch {
            setError('Não foi possível carregar as sessões.');
        }

        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function criar(session) {

        const data = await api.post('/sessoes-foco', session);
        setSessions(prev => [data, ...prev]);
        return data;
    }
    async function excluir(id) {
        await api.delete(`/sessoes-foco/${id}`);
        setSessions(prev => prev.filter(s => s.id !== id));
    }
    return {
        sessions,
        loading,
        error,
        criar,
        excluir,
        atualizar: carregar
    };
}