import { useState } from 'react';
import { Sidebar, MobileHeader, MobileTabBar } from './components/Navigation';
import { ApiOfflineScreen } from './components/ApiOfflineScreen';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { DailyHabitsView } from './components/DailyHabitsView';
import { AtomicHabitsView } from './components/AtomicHabitsView';
import { useIsMobile } from './hooks/useIsMobile';
import { useApiHealth } from './hooks/useApiHealth';
import { useTarefas } from './hooks/useTarefas';
import { useHabitosDiarios } from './hooks/useHabitosDiarios';
import { useRegistroHoje, useHistoricoAtomico, useHistoricoCompleto } from './hooks/useRegistrosAtomicos';
import './index.css';

export default function App() {
  const [view, setView] = useState('home');
  const [range, setRange] = useState(14);
  const isMobile = useIsMobile();
  const online = useApiHealth();

  const tarefasState = useTarefas();
  const habitosState = useHabitosDiarios();
  const registroHojeState = useRegistroHoje();
  const historicoState = useHistoricoAtomico(range);
  const historicoAnualState = useHistoricoAtomico(365);
  const historicoCompletoState = useHistoricoCompleto();

  // Enquanto não sabemos se a API está online, evita piscar a tela de erro.
  if (online === false) {
    return <ApiOfflineScreen />;
  }

  return (
    <div className="app">
      {isMobile && <MobileHeader online={online} />}
      <div className="body-row">
        {!isMobile && <Sidebar view={view} setView={setView} online={online} />}
        <main className="main" style={{ paddingBottom: isMobile ? 88 : 48 }}>
          {view === 'home' && (
            <HomeView
              tarefas={tarefasState.tarefas}
              habitos={habitosState.habitos}
              registroHoje={registroHojeState.registro}
              historicoAnual={historicoAnualState.historico}
              onAtualizarAgua={(v) => registroHojeState.atualizarCampo({ agua: v })}
              setView={setView}
              loadingResumo={habitosState.loading}
            />
          )}

          {view === 'tasks' && (
            <TasksView
              tarefas={tarefasState.tarefas}
              loading={tarefasState.loading}
              error={tarefasState.error}
              criar={tarefasState.criar}
              atualizar={tarefasState.atualizar}
              atualizarStatus={tarefasState.atualizarStatus}
              excluir={tarefasState.excluir}
            />
          )}

          {view === 'daily' && (
            <DailyHabitsView
              habitos={habitosState.habitos}
              loading={habitosState.loading}
              error={habitosState.error}
              criar={habitosState.criar}
              alternarFeito={habitosState.alternarFeito}
              reordenar={habitosState.reordenar}
              resetarDia={habitosState.resetarDia}
              excluir={habitosState.excluir}
            />
          )}

          {view === 'atomic' && (
            <AtomicHabitsView
              registroHoje={registroHojeState.registro}
              loadingHoje={registroHojeState.loading}
              erroHoje={registroHojeState.error}
              onAtualizarHoje={registroHojeState.atualizarCampo}
              historico={historicoState.historico}
              loadingHistorico={historicoState.loading}
              erroHistorico={historicoState.error}
              range={range}
              setRange={setRange}
              historicoCompleto={historicoCompletoState.historico}
              loadingCompleto={historicoCompletoState.loading}
              onExcluirRegistro={historicoCompletoState.excluir}
            />
          )}
        </main>
      </div>
      {isMobile && <MobileTabBar view={view} setView={setView} />}
    </div>
  );
}
