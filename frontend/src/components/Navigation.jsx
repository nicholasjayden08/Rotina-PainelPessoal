/**
 * Toda a navegação do app num arquivo só, com 3 variações pro mesmo
 * NAV_ITEMS: Sidebar (desktop), MobileHeader (topo no mobile) e
 * MobileTabBar (tab bar fixa embaixo no mobile) — qual delas renderiza
 * é decidido no App.jsx via useIsMobile.
 */

import { Home, CheckSquare, Sun, Activity, Wifi, WifiOff, BookOpen, ChartColumn, Zap, Target, CalendarRange, HardDrive } from 'lucide-react';
import { COLORS } from '../constants';
import { useUltimoBackup } from '../hooks/useUltimoBackup';

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
    { id: 'planning', label: 'planejamento', icon: CalendarRange },
    { id: 'statistics', label: 'estatísticas', icon: ChartColumn},
    { id: 'focus', label: 'foco', icon: Target },
];

function fmtUltimoBackup(iso) {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return `hoje, ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `ontem, ${hora}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hora}`;
}

export function Sidebar({ view, setView, online }) {
  const ultimoBackup = useUltimoBackup(online);
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
        {online && (
          <div className="connection-indicator" style={{ marginTop: 6 }}>
            <HardDrive size={13} color={COLORS.textMutedLight} />
            <span>{ultimoBackup ? `último backup: ${fmtUltimoBackup(ultimoBackup)}` : 'nenhum backup ainda'}</span>
          </div>
        )}
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