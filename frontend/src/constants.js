export const TASK_TYPES = [
  { id: 'CARREIRA', label: 'Carreira', color: '#E8A33D' },
  { id: 'PESSOAL', label: 'Pessoal', color: '#5B9FED' },
  { id: 'FACULDADE', label: 'Faculdade', color: '#3DDC84' },
];

export const EFFORT_LEVELS = [
  { id: 'PEQUENO', label: 'Pequeno', color: '#3DDC84' },
  { id: 'MEDIA', label: 'Média', color: '#E8A33D' },
  { id: 'GRANDE', label: 'Grande', color: '#E2504A' },
];

export const PRIORITIES = [
  { id: 'ALTA', label: 'Alta', color: '#E2504A' },
  { id: 'MEDIA', label: 'Média', color: '#E8A33D' },
  { id: 'BAIXA', label: 'Baixa', color: '#3DDC84' },
];

export const STATUSES = [
  { id: 'NAO_INICIADO', label: 'Não iniciado' },
  { id: 'EM_ANDAMENTO', label: 'Em andamento' },
  { id: 'CONCLUIDO', label: 'Concluído' },
];

export const PERIODS = [
  { id: 'MANHA', label: 'Manhã' },
  { id: 'TARDE', label: 'Tarde' },
  { id: 'NOITE', label: 'Noite' },
  { id: 'DIA', label: 'Durante o dia' },
];

export const MOODS = [
  { id: 'PRODUTIVO', label: 'Produtivo', color: '#5B9FED' },
  { id: 'NORMAL', label: 'Normal', color: '#3DDC84' },
  { id: 'ANSIOSO', label: 'Ansioso', color: '#E8A33D' },
  { id: 'CANSADO', label: 'Cansado', color: '#E8A33D' },
  { id: 'TRISTE', label: 'Triste', color: '#E2504A' },
];

export const SLEEP_QUALITY = [
  { id: 'PERFEITO', label: 'Perfeito', score: 5 },
  { id: 'MUITO_BOM', label: 'Muito bom', score: 4 },
  { id: 'BOM', label: 'Bom', score: 3 },
  { id: 'MAIS_OU_MENOS', label: 'Mais ou menos', score: 2 },
  { id: 'RUIM', label: 'Ruim', score: 1 },
];

export const WATER_GOAL = 4;

export function findLabel(list, id) {
  const item = list.find((x) => x.id === id);
  return item ? item.label : '';
}

export function findColor(list, id) {
  const item = list.find((x) => x.id === id);
  return item ? item.color : '#5A5F68';
}
