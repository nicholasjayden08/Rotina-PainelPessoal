export const COLORS = {
  // status/semântico
  success: '#3DDC84',
  info: '#5B9FED',
  warning: '#E8A33D',
  danger: '#E2504A',
  accent: '#9652F6',

  // texto
  textPrimary: '#EDEFF2',
  textSecondary: '#f0efed',
  textBody: '#d8d7d4',
  textMuted: '#5A5F68',
  textMutedLight: '#7A7F88',
  textInverse: '#0D0F12',

  // superfícies e bordas
  border: '#2A2E35',
  gridLine: '#1F2329',
  tooltipBg: '#1B1F26',
  cellInactive: '#2c2c2c',
  trackBg: '#21252B',
};

// Escala de intensidade usada no heatmap anual e na faixa de heatmap curta.
// Único lugar que define essa progressão - antes YearHeatmap e HeatmapStrip
// tinham cada um a sua própria escala, ligeiramente diferentes.
export const HEATMAP_SCALE = [
  COLORS.cellInactive, '#143824', '#1A5A35', '#238A4A', '#2FCB6B', COLORS.success,
];

export const TASK_TYPES = [
  { id: 'CARREIRA', label: 'Carreira', color: COLORS.warning },
  { id: 'PESSOAL', label: 'Pessoal', color: COLORS.info },
  { id: 'FACULDADE', label: 'Faculdade', color: COLORS.success },
];

export const EFFORT_LEVELS = [
  { id: 'PEQUENO', label: 'Pequeno', color: COLORS.success },
  { id: 'MEDIA', label: 'Média', color: COLORS.warning },
  { id: 'GRANDE', label: 'Grande', color: COLORS.danger },
];

export const PRIORITIES = [
  { id: 'ALTA', label: 'Alta', color: COLORS.danger },
  { id: 'MEDIA', label: 'Média', color: COLORS.warning },
  { id: 'BAIXA', label: 'Baixa', color: COLORS.success },
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
  { id: 'PRODUTIVO', label: 'Produtivo', color: COLORS.info },
  { id: 'NORMAL', label: 'Normal', color: COLORS.success },
  { id: 'ANSIOSO', label: 'Ansioso', color: COLORS.warning },
  { id: 'CANSADO', label: 'Cansado', color: COLORS.warning },
  { id: 'TRISTE', label: 'Triste', color: COLORS.danger },
];

export const SLEEP_QUALITY = [
  { id: 'PERFEITO', label: 'Perfeito', score: 5 },
  { id: 'MUITO_BOM', label: 'Muito bom', score: 4 },
  { id: 'BOM', label: 'Bom', score: 3 },
  { id: 'MAIS_OU_MENOS', label: 'Mais ou menos', score: 2 },
  { id: 'RUIM', label: 'Ruim', score: 1 },
];

export const WATER_GOAL = 4;

// Hábitos atômicos rastreados individualmente pra streak de motivação.
// 'campo' é a chave no registro atômico; 'qualifica' decide se aquele dia conta.
export const HABITOS_STREAK = [
  { campo: 'acordarCedo', label: 'acordando cedo', qualifica: (r) => !!r.acordarCedo },
  { campo: 'estudos', label: 'estudando', qualifica: (r) => !!r.estudos },
  { campo: 'trabalho', label: 'trabalhando', qualifica: (r) => !!r.trabalho },
  { campo: 'academia', label: 'na academia', qualifica: (r) => !!r.academia },
  { campo: 'agua', label: 'batendo a meta de água', qualifica: (r) => (r.agua || 0) >= WATER_GOAL },
];

export const STREAK_MARCOS = [5, 10, 15, 30, 60, 100, 150, 200, 365];

export function findLabel(list, id) {
  const item = list.find((x) => x.id === id);
  return item ? item.label : '';
}

export function findColor(list, id) {
  const item = list.find((x) => x.id === id);
  return item ? item.color : COLORS.textMuted;
}
