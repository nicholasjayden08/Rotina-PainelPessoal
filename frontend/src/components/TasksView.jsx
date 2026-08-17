import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { TaskFormModal } from './TaskFormModal';
import { EmptyHint, LoadingBlock, ErrorBlock } from './Shared';
import { STATUSES } from '../constants';

export function TasksView({ tarefas, loading, error, criar, atualizar, atualizarStatus, excluir }) {
  const [filter, setFilter] = useState('pendentes');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draftNovaTarefa, setDraftNovaTarefa] = useState(null);

  const filtradas = useMemo(() => {
    if (filter === 'concluidas') return tarefas.filter((t) => t.status === 'CONCLUIDO');
    if (filter === 'pendentes') return tarefas.filter((t) => t.status !== 'CONCLUIDO');
    return tarefas;
  }, [tarefas, filter]);

  const ordenadas = [...filtradas].sort((a, b) => {
    const order = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
    return (order[a.prioridade] ?? 3) - (order[b.prioridade] ?? 3);
  });

  async function handleSave(dados) {
    if (editing) {
      await atualizar(editing.id, dados);
    } else {
      await criar(dados);
      setDraftNovaTarefa(null);
    }
    setShowForm(false);
    setEditing(null);
  }

  function cycleStatus(task) {
    const ids = STATUSES.map((s) => s.id);
    const idx = ids.indexOf(task.status);
    const next = ids[(idx + 1) % ids.length];
    atualizarStatus(task.id, next);
  }

  return (
    <div className="view-wrap fade-in">
      <header className="page-header page-header-responsive">
        <div>
          <p className="eyebrow">organização</p>
          <h1 className="page-title">tarefas do dia</h1>
        </div>
        <button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={15} /> nova tarefa
        </button>
      </header>

      <ErrorBlock text={error} />

      <div className="filter-row">
        {[
          { id: 'pendentes', label: `pendentes (${tarefas.filter((t) => t.status !== 'CONCLUIDO').length})` },
          { id: 'concluidas', label: `concluídas (${tarefas.filter((t) => t.status === 'CONCLUIDO').length})` },
          { id: 'todas', label: `todas (${tarefas.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-chip ${filter === f.id ? 'filter-chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock text="carregando tarefas..." />
      ) : ordenadas.length === 0 ? (
        <EmptyHint text="nenhuma tarefa por aqui. crie uma pra começar." />
      ) : (
        <div className="task-list">
          {ordenadas.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onCycleStatus={() => cycleStatus(t)}
              onEdit={() => { setEditing(t); setShowForm(true); }}
              onDelete={() => excluir(t.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
          <TaskFormModal
              initial={editing || draftNovaTarefa}
              onSave={handleSave}
              onClose={() => { setShowForm(false); setEditing(null); }}
              onDraftChange={editing ? undefined : setDraftNovaTarefa}
          />
      )}
    </div>
  );
}
