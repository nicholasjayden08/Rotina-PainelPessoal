// Wrapper fino sobre /backups: lista os backups do banco e dispara um manual.

import { api } from './client';

export const backupsApi = {

    listar: () => api.get('/backups'),

    criar: () => api.post('/backups'),

};