import { useState } from 'react';
import { Plus, Clock, Edit3, Trash2, Check } from 'lucide-react';
import { DailyHabitFormModal } from './DailyHabitFormModal';
import { EmptyHint, LoadingBlock, ErrorBlock } from './Shared';
import { PERIODS } from '../constants';

export function DailyHabitsView({ habitos, loading, error, criar, atualizar, alternarFeito, resetarDia, excluir }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const grouped = PERIODS.map((p) => ({
    ...p,
    items: habitos.filter((h) => h.periodo === p.id),
  }));

  async function handleSave(dados) {
    if (editing) {
      await atualizar(editing.id, dados);
    } else {
      await criar(dados);
    }
    setShowForm(false);
    setEditing(null);
  }

  const feitos = habitos.filter((h) => h.feito).length;

  return (
    <div className="view-wrap fade-in">
      <header className="page-header page-header-responsive">
        <div>
          <p className="eyebrow">routinely</p>
          <h1 className="page-title">hábitos diários</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary-btn" onClick={resetarDia}>
            <Clock size={14} /> resetar dia
          </button>
          <button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={15} /> novo hábito
          </button>
        </div>
      </header>

      <ErrorBlock text={error} />

      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${habitos.length ? (feitos / habitos.length) * 100 : 0}%` }} />
      </div>
      <p className="progress-label">{feitos} de {habitos.length} concluídos hoje</p>

      {loading ? (
        <LoadingBlock text="carregando hábitos..." />
      ) : habitos.length === 0 ? (
        <EmptyHint text="nenhum hábito cadastrado. adicione o que você quer repetir todo dia." />
      ) : (
        <div className="period-groups">
          {grouped.filter((g) => g.items.length > 0).map((g) => (
            <div key={g.id} className="period-group">
              <p className="period-label">{g.label}</p>
              <div className="task-list">
                {g.items.map((h) => (
                  <div key={h.id} className="habit-row">
                    <button onClick={() => alternarFeito(h.id)} className="habit-check-btn" aria-label="marcar como feito">
                      <span className={`habit-check-box ${h.feito ? 'habit-check-box-done' : ''}`}>
                        {h.feito && <Check size={13} strokeWidth={3} color="#0D0F12" />}
                      </span>
                    </button>
                    <div style={{ flex: 1 }}>
                      <p className="habit-name" style={{ textDecoration: h.feito ? 'line-through' : 'none', opacity: h.feito ? 0.5 : 1 }}>
                        {h.nome}
                      </p>
                      {h.meta && <p className="habit-meta">{h.meta}</p>}
                    </div>
                    <div className="task-actions">
                      <button className="icon-btn" onClick={() => { setEditing(h); setShowForm(true); }} aria-label="editar"><Edit3 size={14} /></button>
                      <button className="icon-btn" onClick={() => excluir(h.id)} aria-label="excluir"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DailyHabitFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
