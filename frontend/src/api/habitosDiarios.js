// Wrapper fino sobre /insights: busca os insights automáticos de um mês.

import { api } from './client';

export const habitosDiariosApi = {
  listar: () => api.get('/habitos-diarios'),
  criar: (dados) => api.post('/habitos-diarios', dados),
  atualizar: (id, dados) => api.put(`/habitos-diarios/${id}`, dados),
  alternarFeito: (id) => api.patch(`/habitos-diarios/${id}/toggle`),
  reordenar: (habitos) => api.put('/habitos-diarios/reordenar', { habitos }),
  resetarDia: () => api.post('/habitos-diarios/resetar-dia'),
  excluir: (id) => api.delete(`/habitos-diarios/${id}`),
};
