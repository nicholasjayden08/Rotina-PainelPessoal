import { daysAgo } from './date';
import { WATER_GOAL, HABITOS_STREAK } from '../constants';

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

// Streak individual por hábito (ex: "5 dias acordando cedo"), reaproveitando
// a mesma varredura de calendário — dia sem registro quebra a sequência.
export function computeHabitStreaks(historico) {
  const map = {};
  historico.forEach((e) => { map[e.data] = e; });

  const resultado = {};
  HABITOS_STREAK.forEach(({ campo, qualifica: qualificaHabito }) => {
    let current = 0;
    for (let i = 364; i >= 0; i--) {
      const iso = daysAgo(i);
      const isHoje = i === 0;
      const entry = map[iso];
      if (entry && qualificaHabito(entry)) {
        current++;
      } else if (!isHoje) {
        current = 0;
      }
    }
    resultado[campo] = current;
  });
  return resultado;
}