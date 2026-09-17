// Wrapper fino sobre /estatisticas: lista os meses com dados e busca o resumo de um mês.

import { api } from './client';

export const estatisticasApi = {

    buscarMeses: () =>
        api.get('/estatisticas/meses'),

    buscarEstatisticas: (ano, mes) =>
        api.get(`/estatisticas?ano=${ano}&mes=${mes}`),

};