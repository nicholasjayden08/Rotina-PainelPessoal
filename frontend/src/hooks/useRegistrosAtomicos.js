import { useState, useEffect, useCallback } from 'react';
import { registrosAtomicosApi } from '../api/registrosAtomicos';
import { todayISO, daysAgo } from '../utils/date';

export function useRegistroHoje() {
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await registrosAtomicosApi.buscarHoje();
      setRegistro(dados);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function atualizarCampo(patch) {
    setRegistro((prev) => ({ ...prev, ...patch }));
    try {
      const atualizado = await registrosAtomicosApi.atualizarParcial(todayISO(), patch);
      setRegistro(atualizado);
    } catch (e) {
      setError(e.message);
      carregar();
    }
  }

  return { registro, loading, error, atualizarCampo, recarregar: carregar };
}

export function useHistoricoAtomico(dias) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inicio = daysAgo(dias - 1);
      const fim = todayISO();
      const dados = await registrosAtomicosApi.buscarPorIntervalo(inicio, fim);
      setHistorico(dados);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dias]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { historico, loading, error, recarregar: carregar };
}

export function useHistoricoCompleto() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await registrosAtomicosApi.listar();
      setHistorico(dados.sort((a, b) => b.data.localeCompare(a.data)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id) {
    await registrosAtomicosApi.excluir(id);
    setHistorico((prev) => prev.filter((r) => r.id !== id));
  }

  return { historico, loading, excluir, recarregar: carregar };
}
