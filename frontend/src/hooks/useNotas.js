/**
 * CRUD de notas + fixar(). ordenarNotas() mantém a lista sempre com
 * fixadas primeiro, depois por data de atualização mais recente — é
 * reaplicada depois de toda operação que muda a lista (criar, atualizar,
 * fixar) pra ordem não ficar inconsistente na tela.
 */

import { useState, useEffect, useCallback } from 'react';
import { notasApi } from '../api/notas';

function ordenarNotas(lista) {
    return [...lista].sort((a, b) => {
        if (a.fixado !== b.fixado) return a.fixado ? -1 : 1;
        return new Date(b.dataAtualizacao) - new Date(a.dataAtualizacao);
    });
}

export function useNotas() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const dados = await notasApi.listar();
            setNotas(dados);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function criar(dados) {
        const nova = await notasApi.criar(dados);
        setNotas((prev) => ordenarNotas([nova, ...prev]));
        return nova;
    }

    async function atualizar(id, dados) {
        const atualizada = await notasApi.atualizar(id, dados);
        setNotas((prev) => ordenarNotas(prev.map((n) => n.id === id ? atualizada : n)));
        return atualizada;
    }

    async function excluir(id) {
        await notasApi.excluir(id);
        setNotas((prev) => prev.filter((n) => n.id !== id));
    }

    async function fixar(id) {
        const atualizada = await notasApi.fixar(id);
        setNotas((prev) => ordenarNotas(prev.map((n) => n.id === id ? atualizada : n)));
        return atualizada;
    }

    return { notas, loading, error, criar, atualizar, excluir, fixar };
}