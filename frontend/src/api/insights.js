// Wrapper fino sobre /insights: busca os insights automáticos de um mês.

import { api } from './client';

export const insightsApi = {

    buscarInsights: (ano, mes) =>
        api.get(`/insights?ano=${ano}&mes=${mes}`),

};