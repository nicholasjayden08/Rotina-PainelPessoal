/**
 * Formulário do registro atômico de hoje (dormiu/acordou, água, humor,
 * sono, checkboxes de hábito). Não tem estado próprio — cada onChange
 * já dispara direto pro pai (que faz o PATCH otimista via useRegistroHoje).
 * CheckboxPill é um botão-pílula reaproveitado só aqui pros 4 hábitos
 * booleanos (acordar cedo, estudos, trabalho, academia).
 */

import { FormField } from './Shared';
import { CustomSelect } from './CustomSelect';
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
                <CustomSelect
                    value={registro.humor || ''}
                    onChange={(v) => onChange({ humor: v || null })}
                    options={MOODS.map((m) => ({ value: m.id, label: m.label }))}
                />
            </FormField>

            <FormField label="qualidade do sono">
                <CustomSelect
                    value={registro.sono || ''}
                    onChange={(v) => onChange({ sono: v || null })}
                    options={SLEEP_QUALITY.map((s) => ({ value: s.id, label: s.label }))}
                />
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