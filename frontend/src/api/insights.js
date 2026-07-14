import { api } from './client';

export const insightsApi = {

    buscarInsights: (ano, mes) =>
        api.get(`/insights?ano=${ano}&mes=${mes}`),

};