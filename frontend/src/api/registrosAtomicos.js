// Wrapper fino sobre /registros-atomicos: listar, hoje, buscar por intervalo, PATCH parcial por data, excluir.

import { api } from './client';

export const registrosAtomicosApi = {
  listar: () => api.get('/registros-atomicos'),
  buscarHoje: () => api.get('/registros-atomicos/hoje'),
  buscarPorIntervalo: (inicio, fim) =>
    api.get(`/registros-atomicos/intervalo?inicio=${inicio}&fim=${fim}`),
  atualizarParcial: (data, dados) => api.patch(`/registros-atomicos/data/${data}`, dados),
  excluir: (id) => api.delete(`/registros-atomicos/${id}`),
};
