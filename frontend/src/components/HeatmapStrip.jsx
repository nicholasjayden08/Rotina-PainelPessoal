/**
 * Faixa dos últimos 14 dias (mini-heatmap da Home, não confundir com
 * o YearHeatmap). scoreFor() dá uma pontuação de 0 a 5 por dia (água na
 * meta + 4 hábitos booleanos) que vira a cor da célula via HEATMAP_SCALE.
 */

import { rangeDays, fmtDateLabel } from '../utils/date';
import { WATER_GOAL, HEATMAP_SCALE } from '../constants';

function scoreFor(entry) {
  if (!entry) return 0;
  let s = 0;
  if ((entry.agua || 0) >= WATER_GOAL) s++;
  if (entry.estudos) s++;
  if (entry.trabalho) s++;
  if (entry.acordarCedo) s++;
  if (entry.academia) s++;
  return s;
}

export function HeatmapStrip({ historico }) {
  const days = rangeDays(14);
  const map = {};
  historico.forEach((e) => {
    map[e.data] = e;
  });

  return (
    <div className="heatmap-row">
      {days.map((d) => {
        const score = scoreFor(map[d]);
        return (
          <div key={d} className="heatmap-cell">
            <div className="heatmap-box" style={{ background: HEATMAP_SCALE[score] }} title={`${d}: ${score}/5`} />
            <span className="heatmap-label">{fmtDateLabel(d).split(' ')[0]}</span>
          </div>
        );
      })}
    </div>
  );
}
