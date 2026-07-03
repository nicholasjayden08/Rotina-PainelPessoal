import { api } from './client';

export const notasApi = {
    listar: () => api.get('/notas'),
    buscar: (id) => api.get(`/notas/${id}`),
    criar: (dados) => api.post('/notas', dados),
    atualizar: (id, dados) => api.put(`/notas/${id}`, dados),
    excluir: (id) => api.delete(`/notas/${id}`),
};