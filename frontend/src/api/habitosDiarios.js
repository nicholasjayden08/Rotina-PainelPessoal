import { api } from './client';

export const habitosDiariosApi = {
  listar: () => api.get('/habitos-diarios'),
  criar: (dados) => api.post('/habitos-diarios', dados),
  atualizar: (id, dados) => api.put(`/habitos-diarios/${id}`, dados),
  alternarFeito: (id) => api.patch(`/habitos-diarios/${id}/toggle`),
  resetarDia: () => api.post('/habitos-diarios/resetar-dia'),
  excluir: (id) => api.delete(`/habitos-diarios/${id}`),
};
