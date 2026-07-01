import { Home, CheckSquare, Sun, Activity, Wifi, WifiOff } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'painel', icon: Home },
  { id: 'tasks', label: 'tarefas', icon: CheckSquare },
  { id: 'daily', label: 'hábitos', icon: Sun },
  { id: 'atomic', label: 'atômicos', icon: Activity },
];

export function Sidebar({ view, setView, online }) {
  return (
    <nav className="sidebar">
      <div className="logo">
        <span className="logo-bracket">~/</span>
          <span className="logo-text">routinely</span>
      </div>
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
              <Icon size={16} strokeWidth={active ? 2 : 1.75} color={active ? '#3DDC84' : undefined} />
              <span>{item.id === 'tasks' ? 'tarefas do dia' : item.id === 'daily' ? 'hábitos diários' : item.id === 'atomic' ? 'hábitos atômicos' : item.label}</span>
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
      <div className="logo">
        <span className="logo-bracket">~/</span>
          <span className="logo-text">routinely</span>
      </div>
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
            style={{ color: active ? '#3DDC84' : '#7A7F88' }}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
            <span className="mobile-tab-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ConnectionIndicator({ online }) {
  return (
    <div className="connection-indicator">
      {online ? <Wifi size={13} color="#3DDC84" /> : <WifiOff size={13} color="#E2504A" />}
      <span style={{ color: online ? '#7A7F88' : '#E2504A' }}>
        {online ? 'conectado à API' : 'sem conexão com o servidor'}
      </span>
    </div>
  );
}
