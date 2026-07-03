import { useState, useEffect } from 'react';
import { notasApi } from '../api/notas';

export function useNotas() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ativo = true;
        setLoading(true);
        notasApi.listar()
            .then((dados) => { if (ativo) { setNotas(dados); setLoading(false); } })
            .catch((e) => { if (ativo) { setError(e.message); setLoading(false); } });
        return () => { ativo = false; };
    }, []);

    async function criar(dados) {
        const nova = await notasApi.criar(dados);
        setNotas((prev) => [nova, ...prev]);
        return nova;
    }

    async function atualizar(id, dados) {
        const atualizada = await notasApi.atualizar(id, dados);
        setNotas((prev) => prev.map((n) => n.id === id ? atualizada : n));
        return atualizada;
    }

    async function excluir(id) {
        await notasApi.excluir(id);
        setNotas((prev) => prev.filter((n) => n.id !== id));
    }

    return { notas, loading, error, criar, atualizar, excluir };
}