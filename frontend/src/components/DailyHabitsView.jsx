import { useState, useMemo } from 'react';
import { Plus, Clock, Edit3, Trash2, Check, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DailyHabitFormModal } from './DailyHabitFormModal';
import { EmptyHint, LoadingBlock, ErrorBlock } from './Shared';
import { PERIODS } from '../constants';

export function DailyHabitsView({ habitos, loading, error, criar, atualizar, alternarFeito, reordenar, resetarDia, excluir }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const grouped = useMemo(
      () => PERIODS.map((p) => ({ ...p, items: habitos.filter((h) => h.periodo === p.id) })),
      [habitos]
  );

  async function handleSave(dados) {
    if (editing) { await atualizar(editing.id, dados); }
    else { await criar(dados); }
    setShowForm(false);
    setEditing(null);
  }

  const feitos = habitos.filter((h) => h.feito).length;

  function findPeriodoAtual(id) {
    return habitos.find((h) => h.id === id)?.periodo;
  }

  function handleDragStart(event) { setActiveId(event.active.id); }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !reordenar) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const habitoAtivo = habitos.find((h) => h.id === activeId);
    if (!habitoAtivo) return;
    const periodoDestino = typeof overId === 'string' && overId.startsWith('group-')
        ? overId.replace('group-', '')
        : findPeriodoAtual(overId);
    if (!periodoDestino) return;
    const semAtivo = habitos.filter((h) => h.id !== activeId);
    const itemMovido = { ...habitoAtivo, periodo: periodoDestino };
    let indexDestino;
    if (typeof overId === 'string' && overId.startsWith('group-')) {
      const itensDoGrupo = semAtivo.filter((h) => h.periodo === periodoDestino);
      const ultimoDoGrupo = itensDoGrupo[itensDoGrupo.length - 1];
      indexDestino = ultimoDoGrupo ? semAtivo.indexOf(ultimoDoGrupo) + 1 : semAtivo.length;
    } else {
      const overItem = semAtivo.find((h) => h.id === overId);
      indexDestino = overItem ? semAtivo.indexOf(overItem) : semAtivo.length;
    }
    const novaLista = [...semAtivo];
    novaLista.splice(indexDestino, 0, itemMovido);
    reordenar(novaLista);
  }

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="period-groups">
                {grouped.map((g) => (
                    <PeriodGroup key={g.id} group={g} onToggle={alternarFeito} onEdit={(h) => { setEditing(h); setShowForm(true); }} onDelete={excluir} />
                ))}
              </div>
            </DndContext>
        )}

        {showForm && (
            <DailyHabitFormModal initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
        )}
      </div>
  );
}

function PeriodGroup({ group, onToggle, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: `group-${group.id}` });
  const ids = group.items.map((h) => h.id);

  return (
      <div className="period-group">
        <p className="period-label">{group.label}</p>
        <div ref={setNodeRef} className="task-list" style={{ minHeight: 8, outline: isOver ? '1px dashed #5B9FED' : 'none', outlineOffset: 4, borderRadius: 8 }}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {group.items.length === 0 ? (
                <p className="habit-meta" style={{ padding: '6px 2px', opacity: 0.5 }}>arraste um hábito pra cá</p>
            ) : (
                group.items.map((h) => (
                    <SortableHabitRow key={h.id} habito={h} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
                ))
            )}
          </SortableContext>
        </div>
      </div>
  );
}

function SortableHabitRow({ habito, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habito.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
      <div ref={setNodeRef} style={style} className="habit-row">
        <button {...attributes} {...listeners} className="icon-btn" aria-label="arrastar para reordenar" style={{ cursor: 'grab', touchAction: 'none' }}>
          <GripVertical size={14} color="#5A5F68" />
        </button>
        <button onClick={() => onToggle(habito.id)} className="habit-check-btn" aria-label="marcar como feito">
        <span className={`habit-check-box ${habito.feito ? 'habit-check-box-done' : ''}`}>
          {habito.feito && <Check size={13} strokeWidth={3} color="#0D0F12" />}
        </span>
        </button>
        <div style={{ flex: 1 }}>
          <p className="habit-name" style={{ textDecoration: habito.feito ? 'line-through' : 'none', opacity: habito.feito ? 0.5 : 1 }}>
            {habito.nome}
          </p>
          {habito.meta && <p className="habit-meta">{habito.meta}</p>}
        </div>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(habito)} aria-label="editar"><Edit3 size={14} /></button>
          <button className="icon-btn" onClick={() => onDelete(habito.id)} aria-label="excluir"><Trash2 size={14} /></button>
        </div>
      </div>
  );
}