import { useState, useEffect, useCallback } from 'react';
import { tarefasApi } from '../api/tarefas';

export function useTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await tarefasApi.listar();
      setTarefas(dados);
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
    const nova = await tarefasApi.criar(dados);
    setTarefas((prev) => [...prev, nova]);
    return nova;
  }

  async function atualizar(id, dados) {
    const atualizada = await tarefasApi.atualizar(id, dados);
    setTarefas((prev) => prev.map((t) => (t.id === id ? atualizada : t)));
    return atualizada;
  }

  async function atualizarStatus(id, status) {
    const atualizada = await tarefasApi.atualizarStatus(id, status);
    setTarefas((prev) => prev.map((t) => (t.id === id ? atualizada : t)));
    return atualizada;
  }

  async function excluir(id) {
    await tarefasApi.excluir(id);
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }

  return { tarefas, loading, error, criar, atualizar, atualizarStatus, excluir, recarregar: carregar };
}
