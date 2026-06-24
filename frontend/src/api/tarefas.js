import { api } from './client';

export const tarefasApi = {
  listar: () => api.get('/tarefas'),
  criar: (dados) => api.post('/tarefas', dados),
  atualizar: (id, dados) => api.put(`/tarefas/${id}`, dados),
  atualizarStatus: (id, status) => api.patch(`/tarefas/${id}/status`, { status }),
  excluir: (id) => api.delete(`/tarefas/${id}`),
};
