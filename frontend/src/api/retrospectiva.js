// Wrapper fino sobre /retrospectiva: busca o resumo anual (só leitura).

import { api } from './client';

export const retrospectivaApi = {

    buscar: (ano) =>
        api.get(`/retrospectiva?ano=${ano}`),

};