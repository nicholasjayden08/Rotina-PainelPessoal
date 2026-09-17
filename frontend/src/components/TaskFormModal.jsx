/**
 * Modal de criar/editar tarefa. onDraftChange (opcional, só usado na
 * criação) reporta o estado do formulário a cada mudança pro pai
 * guardar como rascunho — assim, se o modal fechar e abrir de novo
 * sem salvar, o texto digitado não se perde (ver draftNovaTarefa em
 * TasksView).
 */

import {useEffect, useState} from 'react';
import { Save } from 'lucide-react';
import { ModalShell, FormField } from './Shared';
import { CustomSelect } from './CustomSelect';
import { TASK_TYPES, EFFORT_LEVELS, PRIORITIES, STATUSES, COLORS } from '../constants';

export function TaskFormModal({ initial, onSave, onClose, onDraftChange }) {
  const [nome, setNome] = useState(initial?.nome || '');
  const [descricao, setDescricao] = useState(initial?.descricao || '');
  const [status, setStatus] = useState(initial?.status || 'NAO_INICIADO');
  const [tipos, setTipos] = useState(initial?.tipos || []);
  const [prioridade, setPrioridade] = useState(initial?.prioridade || 'MEDIA');
  const [esforco, setEsforco] = useState(initial?.esforco || 'MEDIA');
  const [prazo, setPrazo] = useState(initial?.prazo || '');
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!onDraftChange) return;
    onDraftChange({nome, descricao, status, tipos, prioridade, esforco, prazo});
  }, [nome, descricao, status, tipos, prioridade, esforco, prazo]);

  function toggleTipo(id) {
    setTipos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!nome.trim()) return;
    setSaving(true);
    setErro(null);
    try {
      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim(),
        status,
        tipos,
        prioridade,
        esforco,
        prazo: prazo || null,
      });
    } catch (e) {
      setErro(e.message);
      setSaving(false);
    }
  }

  return (
      <ModalShell title={initial ? 'editar tarefa' : 'nova tarefa'} onClose={onClose}>
        <FormField label="nome da tarefa">
          <input
              autoFocus
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="ex: revisar matriz de pipeline"
          />
        </FormField>

        <FormField label="descrição">
        <textarea
            className="input"
            style={{ height: 64, resize: 'vertical' }}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="opcional"
        />
        </FormField>

        <div className="form-row form-row-responsive">
          <FormField label="status">
            <CustomSelect
                value={status}
                onChange={setStatus}
                options={STATUSES.map((s) => ({ value: s.id, label: s.label }))}
            />
          </FormField>
          <FormField label="prazo">
            <input type="date" className="input" value={prazo || ''} onChange={(e) => setPrazo(e.target.value)} />
          </FormField>
        </div>

        <div className="form-row form-row-responsive">
          <FormField label="prioridade">
            <CustomSelect
                value={prioridade}
                onChange={setPrioridade}
                options={PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
            />
          </FormField>
          <FormField label="nível de esforço">
            <CustomSelect
                value={esforco}
                onChange={setEsforco}
                options={EFFORT_LEVELS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </FormField>
        </div>

        <FormField label="tipo de tarefa">
          <div className="chip-row">
            {TASK_TYPES.map((t) => (
                <button
                    key={t.id}
                    onClick={() => toggleTipo(t.id)}
                    className="chip"
                    style={{
                      borderColor: tipos.includes(t.id) ? t.color : COLORS.border,
                      color: tipos.includes(t.id) ? t.color : COLORS.textMutedLight,
                      background: tipos.includes(t.id) ? t.color + '14' : 'transparent',
                    }}
                >
                  {t.label}
                </button>
            ))}
          </div>
        </FormField>

        {erro && <p className="error-block">⚠ {erro}</p>}

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>cancelar</button>
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? 'salvando...' : 'salvar'}
          </button>
        </div>
      </ModalShell>
  );
}