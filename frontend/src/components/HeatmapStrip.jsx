import { rangeDays, fmtDateLabel } from '../utils/date';
import { WATER_GOAL } from '../constants';

const COLORS = ['#1A1D22', '#163826', '#1C5235', '#1F7A45', '#3DDC84'];

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
            <div className="heatmap-box" style={{ background: COLORS[score] }} title={`${d}: ${score}/5`} />
            <span className="heatmap-label">{fmtDateLabel(d).split(' ')[0]}</span>
          </div>
        );
      })}
    </div>
  );
}
