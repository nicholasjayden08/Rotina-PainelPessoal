import { daysAgo } from './date';
import { WATER_GOAL } from '../constants';

export function computeStreak(historico) {
  const map = {};
  historico.forEach((e) => {
    map[e.data] = e;
  });

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const iso = daysAgo(i);
    const e = map[iso];
    const qualifica = e && ((e.agua || 0) >= WATER_GOAL || e.estudos || e.trabalho || e.acordarCedo);
    if (qualifica) {
      streak++;
    } else {
      if (i === 0) continue; // hoje pode ainda não ter sido preenchido, não quebra o streak por isso
      break;
    }
  }
  return streak;
}
