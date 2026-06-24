import { X } from 'lucide-react';

export function MetricCard({ label, value, sub, onClick }) {
  return (
    <div className="metric-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
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
