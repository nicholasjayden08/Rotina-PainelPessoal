function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toLocalISO(new Date());
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalISO(d);
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

export function fmtTimePT(time) {
  if (!time) return '';
  return time.slice(0, 5);
}

export function rangeDays(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(daysAgo(i));
  return arr;
}
