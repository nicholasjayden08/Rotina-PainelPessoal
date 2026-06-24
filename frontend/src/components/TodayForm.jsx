import { FormField } from './Shared';
import { CheckSquare } from 'lucide-react';
import { MOODS, SLEEP_QUALITY } from '../constants';

export function TodayForm({ registro, onChange }) {
  if (!registro) return null;

  return (
    <div className="today-form-grid">
      <FormField label="acordei às">
        <input
          type="time"
          className="input"
          value={registro.acordeiAs || ''}
          onChange={(e) => onChange({ acordeiAs: e.target.value || null })}
        />
      </FormField>

      <FormField label="água (litros)">
        <input
          type="number" step="0.25" min="0" max="8"
          className="input"
          value={registro.agua || 0}
          onChange={(e) => onChange({ agua: parseFloat(e.target.value) || 0 })}
        />
      </FormField>

      <FormField label="humor">
        <select className="input" value={registro.humor || ''} onChange={(e) => onChange({ humor: e.target.value || null })}>
          <option value="">selecionar</option>
          {MOODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </FormField>

      <FormField label="qualidade do sono">
        <select className="input" value={registro.sono || ''} onChange={(e) => onChange({ sono: e.target.value || null })}>
          <option value="">selecionar</option>
          {SLEEP_QUALITY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </FormField>

      <div className="checkbox-row">
        <CheckboxPill label="acordar cedo" checked={!!registro.acordarCedo} onChange={(v) => onChange({ acordarCedo: v })} />
        <CheckboxPill label="estudos" checked={!!registro.estudos} onChange={(v) => onChange({ estudos: v })} />
        <CheckboxPill label="trabalho" checked={!!registro.trabalho} onChange={(v) => onChange({ trabalho: v })} />
      </div>
    </div>
  );
}

function CheckboxPill({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="pill-btn"
      style={{
        borderColor: checked ? '#3DDC84' : '#2A2E35',
        color: checked ? '#3DDC84' : '#9398A1',
        background: checked ? '#3DDC8414' : 'transparent',
      }}
    >
      <CheckSquare size={14} fill={checked ? '#3DDC84' : 'none'} color={checked ? '#3DDC84' : '#5A5F68'} />
      {label}
    </button>
  );
}
