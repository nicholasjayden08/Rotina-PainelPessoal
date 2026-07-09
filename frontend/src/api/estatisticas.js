import { api } from './client';

export const estatisticasApi = {

    buscarMeses: () =>
        api.get('/estatisticas/meses'),

    buscarEstatisticas: (ano, mes) =>
        api.get(`/estatisticas?ano=${ano}&mes=${mes}`),

};