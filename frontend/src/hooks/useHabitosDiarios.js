/**
 * CRUD + reordenação dos hábitos diários (checklist da Home).
 *
 * alternarFeito() e reordenar() fazem atualização otimista: mudam o
 * estado local ANTES da resposta do servidor (pra não parecer travado
 * em cliques rápidos) e revertem manualmente se a chamada falhar.
 */

import { useState, useEffect, useCallback } from 'react';
import { habitosDiariosApi } from '../api/habitosDiarios';

export function useHabitosDiarios() {
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await habitosDiariosApi.listar();
      setHabitos(dados);
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
    const novo = await habitosDiariosApi.criar(dados);
    setHabitos((prev) => [...prev, novo]);
    return novo;
  }

  async function atualizar(id, dados) {
    const atualizado = await habitosDiariosApi.atualizar(id, dados);
    setHabitos((prev) => prev.map((h) => (h.id === id ? atualizado : h)));
    return atualizado;
  }

  async function alternarFeito(id) {
    // Atualização otimista: alterna na tela antes da resposta do servidor,
    // pra não parecer travado quando o usuário clica rápido em vários checkboxes.
    setHabitos((prev) => prev.map((h) => (h.id === id ? { ...h, feito: !h.feito } : h)));
    try {
      const atualizado = await habitosDiariosApi.alternarFeito(id);
      setHabitos((prev) => prev.map((h) => (h.id === id ? atualizado : h)));
    } catch (e) {
      // reverte em caso de falha
      setHabitos((prev) => prev.map((h) => (h.id === id ? { ...h, feito: !h.feito } : h)));
      setError(e.message);
    }
  }

  async function reordenar(habitosOrdenados) {
    const anterior = habitos;
    setHabitos(habitosOrdenados);
    try {
      const payload = habitosOrdenados.map((h, index) => ({
        id: h.id,
        periodo: h.periodo,
        ordem: index,
      }));
      const atualizados = await habitosDiariosApi.reordenar(payload);
      setHabitos(atualizados);
    } catch (e) {
      setHabitos(anterior);
      setError(e.message);
    }
  }

  async function resetarDia() {
    const atualizados = await habitosDiariosApi.resetarDia();
    setHabitos(atualizados);
  }

  async function excluir(id) {
    await habitosDiariosApi.excluir(id);
    setHabitos((prev) => prev.filter((h) => h.id !== id));
  }

  return { habitos, loading, error, criar, atualizar, alternarFeito, reordenar, resetarDia, excluir, recarregar: carregar };}
