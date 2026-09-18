/**
 * Anel de progresso de água (SVG). O "truque" do anel é
 * strokeDasharray = circunferência total, strokeDashoffset = quanto
 * esconder — daí pct de progresso vira offset = circunferência * (1 - pct).
 * Os botões de incremento (+0.25L etc) chamam onChange já com o novo
 * valor somado (o componente não guarda estado próprio).
 */

import { WATER_GOAL, COLORS } from '../constants';

export function WaterRing({ value, onChange }) {
  const v = value || 0;
  const pct = Math.min(1, v / WATER_GOAL);
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="water-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={COLORS.trackBg} strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={COLORS.info} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="22" fontWeight="600" fill={COLORS.textPrimary} fontFamily="system-ui, -apple-system, sans-serif">
          {v.toFixed(1)}L
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill={COLORS.textMutedLight}>
          de {WATER_GOAL}L
        </text>
      </svg>
      <div className="water-buttons">
        {[0.25, 0.5, 1].map((inc) => (
          <button key={inc} className="water-btn" onClick={() => onChange(Math.round((v + inc) * 100) / 100)}>
            +{inc}L
          </button>
        ))}
        <button className="water-btn-reset" onClick={() => onChange(0)}>
          zerar
        </button>
      </div>
    </div>
  );
}
