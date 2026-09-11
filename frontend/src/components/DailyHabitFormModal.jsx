import { useState } from 'react';
import { Save } from 'lucide-react';
import { ModalShell, FormField } from './Shared';
import { CustomSelect } from './CustomSelect';
import { PERIODS } from '../constants';

export function DailyHabitFormModal({ initial, onSave, onClose }) {
    const [nome, setNome] = useState(initial?.nome || '');
    const [periodo, setPeriodo] = useState(initial?.periodo || 'MANHA');
    const [meta, setMeta] = useState(initial?.meta || '');
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState(null);

    async function handleSave() {
        if (!nome.trim()) return;
        setSaving(true);
        setErro(null);
        try {
            await onSave({ nome: nome.trim(), periodo, meta: meta.trim() });
        } catch (e) {
            setErro(e.message);
            setSaving(false);
        }
    }

    return (
        <ModalShell title={initial ? 'editar hábito' : 'novo hábito'} onClose={onClose}>
            <FormField label="hábito">
                <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: ler 10 páginas" />
            </FormField>
            <FormField label="período">
                <CustomSelect
                    value={periodo}
                    onChange={setPeriodo}
                    options={PERIODS.map((p) => ({ value: p.id, label: p.label }))}
                />
            </FormField>
            <FormField label="meta (opcional)">
                <input className="input" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: 30 minutos" />
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