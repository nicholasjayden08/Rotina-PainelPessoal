import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { TASK_TYPES, PRIORITIES, EFFORT_LEVELS, STATUSES, findLabel, findColor } from '../constants';
import { fmtDatePT } from '../utils/date';

export function TaskRow({ task, onCycleStatus, onEdit, onDelete }) {
  const priority = PRIORITIES.find((p) => p.id === task.prioridade);
  const effort = EFFORT_LEVELS.find((e) => e.id === task.esforco);
  const statusColor = task.status === 'CONCLUIDO' ? '#3DDC84' : task.status === 'EM_ANDAMENTO' ? '#5B9FED' : '#5A5F68';
  const statusLabel = findLabel(STATUSES, task.status);

  return (
    <div className="task-row">
      <button onClick={onCycleStatus} className="status-btn" title="clique para mudar status">
        <span className="status-dot" style={{ background: statusColor }} />
        <span className="status-label" style={{ color: statusColor }}>{statusLabel}</span>
      </button>

      <div className="task-main">
        <p className="task-name" style={{ textDecoration: task.status === 'CONCLUIDO' ? 'line-through' : 'none', opacity: task.status === 'CONCLUIDO' ? 0.5 : 1 }}>
          {task.nome}
        </p>
        {task.descricao && <p className="task-desc">{task.descricao}</p>}
        <div className="task-tags">
          {(task.tipos || []).map((tid) => {
            const t = TASK_TYPES.find((x) => x.id === tid);
            if (!t) return null;
            return (
              <span key={tid} className="tag" style={{ color: t.color, borderColor: t.color + '55' }}>
                {t.label}
              </span>
            );
          })}
          {priority && (
            <span className="tag" style={{ color: priority.color, borderColor: priority.color + '55' }}>
              prioridade {priority.label.toLowerCase()}
            </span>
          )}
          {effort && (
            <span className="tag" style={{ color: effort.color, borderColor: effort.color + '55' }}>
              esforço {effort.label.toLowerCase()}
            </span>
          )}
          {task.prazo && (
            <span className="tag-neutral">
              <Calendar size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
              {fmtDatePT(task.prazo)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={onEdit} aria-label="editar"><Edit3 size={14} /></button>
        <button className="icon-btn" onClick={onDelete} aria-label="excluir"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
