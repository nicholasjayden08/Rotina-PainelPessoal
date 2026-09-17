/**
 * Grab-bag de componentes de UI reaproveitados em várias telas:
 * MetricCard (card de métrica clicável ou não), EmptyHint (texto de
 * "lista vazia"), FormField (label + input padronizado), ModalShell
 * (esqueleto de modal com overlay + header + botão de fechar) e
 * LoadingBlock/ErrorBlock (estados de carregando/erro). Se um componente
 * novo for usado em 2+ telas, o lugar dele é aqui.
 */

import { X } from 'lucide-react';

export function MetricCard({ label, value, sub, onClick }) {
    return (
        <div
            className={`metric-card${onClick ? ' metric-card-clickable' : ''}`}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            <p className="metric-label">{label}</p>
            <p className="metric-value">{value}</p>
            <p className="metric-sub">{sub}</p>
        </div>
    );
}

export function EmptyHint({ text }) {
    return <p className="empty-hint">{text}</p>;
}

export function FormField({ label, children }) {
    return (
        <div className="field">
            <label className="field-label">{label}</label>
            {children}
        </div>
    );
}

export function ModalShell({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="icon-btn" onClick={onClose} aria-label="fechar">
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

export function LoadingBlock({ text = 'carregando...' }) {
    return <p className="loading-block">{text}</p>;
}

export function ErrorBlock({ text }) {
    if (!text) return null;
    return <p className="error-block">⚠ {text}</p>;
}