/**
 * Monitora se o backend está no ar, checando GET /tarefas a cada 10s.
 * `online` começa null (ainda não checou) até true/false. Usado pra
 * mostrar a ApiOfflineScreen quando o backend cai.
 */

import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function useApiHealth() {
  const [online, setOnline] = useState(null); // null = ainda não checou

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch(`${BASE_URL}/tarefas`, { method: 'GET' });
        if (mounted) setOnline(res.ok);
      } catch {
        if (mounted) setOnline(false);
      }
    }

    check();
    const interval = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return online;
}
