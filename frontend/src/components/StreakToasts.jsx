/**
 * Renderiza a fila de toasts de marco de streak (gerada pelo hook
 * useStreakToasts). Cada toast some sozinho depois de DURACAO_MS (6s)
 * ou ao clicar no X — o timer é por item, então vários toasts empilhados
 * somem de forma independente.
 */

import { useEffect } from 'react';
import { Flame, X } from 'lucide-react';

const DURACAO_MS = 6000;

export function StreakToasts({ toasts, dispensar }) {
    if (toasts.length === 0) return null;
    return (
        <div className="streak-toast-stack">
            {toasts.map((t) => (
                <StreakToastItem key={t.id} toast={t} onDismiss={() => dispensar(t.id)} />
            ))}
        </div>
    );
}

function StreakToastItem({ toast, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, DURACAO_MS);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="streak-toast fade-in">
            <Flame size={16} className="streak-toast-icon" />
            <p className="streak-toast-text">{toast.texto}</p>
            <button className="icon-btn streak-toast-close" onClick={onDismiss}><X size={12} /></button>
        </div>
    );
}