import { FormField } from './Shared';
import { Check } from 'lucide-react';
import { MOODS, SLEEP_QUALITY, COLORS } from '../constants';

export function TodayForm({ registro, onChange }) {
  if (!registro) return null;

  return (
    <div className="today-form-grid">
        <FormField label="dormi às">
            <input
                type="time"
                className="input"
                value={registro.dormiAs || ''}
                onChange={(e) => onChange({ dormiAs: e.target.value || null })}
            />
        </FormField>

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
        <CheckboxPill label="academia" checked={!!registro.academia} onChange={(v) => onChange({ academia: v})}/>
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
        borderColor: checked ? COLORS.success : COLORS.border,
        color: checked ? COLORS.success : COLORS.textMutedLight,
        background: checked ? `${COLORS.success}14` : 'transparent',
      }}
    >
      <span className={`habit-check-box ${checked ? 'habit-check-box-done' : ''}`}>
            {checked && <Check size={11} strokeWidth={3} color={COLORS.textInverse} />}
      </span>
        {label}
    </button>
  );
}
