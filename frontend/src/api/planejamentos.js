// Wrapper fino sobre /planejamentos: semana atual, histórico, CRUD, fechar/reabrir e concluir item.

import { api } from './client';

export const planejamentosApi = {
    semanaAtual: () => api.get('/planejamentos/semana-atual'),
    historico: () => api.get('/planejamentos/historico'),
    criar: (dados) => api.post('/planejamentos', dados),
    atualizar: (id, dados) => api.put(`/planejamentos/${id}`, dados),
    fechar: (id) => api.patch(`/planejamentos/${id}/fechar`),
    reabrir: (id) => api.patch(`/planejamentos/${id}/reabrir`),
    concluirItem: (itemId) => api.patch(`/planejamentos/itens/${itemId}/concluir`),
};