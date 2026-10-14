/**
 * Busca a data do backup mais recente (GET /backups) quando a API está
 * online e atualiza a cada 5 min. Retorna o ISO do último backup ou null
 * se não existe nenhum ainda.
 */

import { useState, useEffect } from 'react';
import { backupsApi } from '../api/backups';

export function useUltimoBackup(online) {
    const [ultimo, setUltimo] = useState(null);

    useEffect(() => {
        if (!online) return;
        let mounted = true;

        async function carregar() {
            try {
                const lista = await backupsApi.listar();
                if (mounted) setUltimo(lista.length > 0 ? lista[0].criadoEm : null);
            } catch {
                if (mounted) setUltimo(null);
            }
        }

        carregar();
        const interval = setInterval(carregar, 5 * 60 * 1000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [online]);

    return ultimo;
}