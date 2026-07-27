import { daysAgo } from './date';
import { WATER_GOAL } from '../constants';

function qualifica(entry) {
  if (!entry) return false;
  return (entry.agua || 0) >= WATER_GOAL || entry.estudos || entry.trabalho || entry.acordarCedo || entry.academia;
}

// Percorre os últimos 365 dias do calendário (não só as datas com registro),
// então um dia sem nenhum registro quebra a sequência corretamente.
export function computeStreakInfo(historico) {
  const map = {};
  historico.forEach((e) => { map[e.data] = e; });

  let current = 0, best = 0;
  for (let i = 364; i >= 0; i--) {
    const iso = daysAgo(i);
    const isHoje = i === 0;
    if (qualifica(map[iso])) {
      current++;
      best = Math.max(best, current);
    } else if (!isHoje) {
      current = 0; // hoje sem registro ainda não quebra a sequência
    }
  }

  return { current, best };
}

export function computeStreak(historico) {
  return computeStreakInfo(historico).current;
}