export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function fmtDateLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function fmtDatePT(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function rangeDays(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(daysAgo(i));
  return arr;
}
