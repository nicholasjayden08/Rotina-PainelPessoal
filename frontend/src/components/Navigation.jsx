import { Home, CheckSquare, Sun, Activity, Wifi, WifiOff, BookOpen, ChartColumn, Zap, Target } from 'lucide-react';
import { COLORS } from '../constants';

function Logo() {
    return (
        <div className="logo">
            <Zap size={18} className="logo-icon" fill={COLORS.accent} color={COLORS.accent} />
            <span className="logo-text">Routinely</span>
        </div>
    );
}

const NAV_ITEMS = [
    { id: 'home', label: 'painel', icon: Home },
    { id: 'tasks', label: 'tarefas', icon: CheckSquare },
    { id: 'daily', label: 'hábitos', icon: Sun },
    { id: 'atomic', label: 'atômicos', icon: Activity },
    { id: 'notes', label: 'anotações', icon: BookOpen },
    { id: 'statistics', label: 'estatísticas', icon: ChartColumn},
    { id: 'focus', label: 'foco', icon: Target },
];

export function Sidebar({ view, setView, online }) {
  return (
    <nav className="sidebar">
        <Logo />
      <div className="nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.75} color={active ? COLORS.success : undefined} />
                <span>{item.id === 'tasks' ? 'tarefas do dia' : item.id === 'daily' ? 'hábitos diários' : item.id === 'atomic' ? 'hábitos atômicos' : item.id === 'notes' ? 'anotações' : item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="sidebar-footer">
        <ConnectionIndicator online={online} />
      </div>
    </nav>
  );
}

export function MobileHeader({ online }) {
  return (
    <header className="mobile-header">
        <Logo />
      <ConnectionIndicator online={online} />
    </header>
  );
}

export function MobileTabBar({ view, setView }) {
  return (
    <nav className="mobile-tab-bar">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="mobile-tab-item"
            style={{ color: active ? COLORS.success : COLORS.textMutedLight }}
          >
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
          </button>
        );
      })}
    </nav>
  );
}

function ConnectionIndicator({ online }) {
  return (
    <div className="connection-indicator">
      {online ? <Wifi size={13} color={COLORS.success} /> : <WifiOff size={13} color={COLORS.danger} />}
      <span style={{ color: online ? COLORS.textMutedLight : COLORS.danger }}>
        {online ? 'conectado à API' : 'sem conexão com o servidor'}
      </span>
    </div>
  );
}
