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
import { NotesView } from './components/NotesView';
import { useNotas } from './hooks/useNotas';
import { PlanningView } from './components/PlanningView';
import { usePlanejamentoSemanal } from './hooks/usePlanejamentoSemanal';
import { StatisticsView } from './components/StatisticsView'
import { useMesesEstatisticas } from './hooks/useEstatisticas';
import { FocusView } from './components/FocusView';
import { useFoco } from './hooks/useFoco';
import { StreakToasts } from "./components/StreakToasts.jsx";
import { useStreakToasts } from "./hooks/useStreakToasts.js";
import './index.css';

export default function App() {
  const VALID_VIEWS = ['home', 'tasks', 'daily', 'atomic', 'notes', 'planning', 'statistics', 'focus'];
  const hashView = window.location.hash.replace('#', '');
  const [view, setViewState] = useState(VALID_VIEWS.includes(hashView) ? hashView : 'home');

  function setView(v) {
    window.location.hash = v;
    setViewState(v);
  }  const [range, setRange] = useState(14);
  const isMobile = useIsMobile();
  const online = useApiHealth();

  const tarefasState = useTarefas();
  const habitosState = useHabitosDiarios();
  const registroHojeState = useRegistroHoje();
  const historicoState = useHistoricoAtomico(range);
  const historicoAnualState = useHistoricoAtomico(365);
  const historicoCompletoState = useHistoricoCompleto();
   const notasState = useNotas();
  const planejamentoState = usePlanejamentoSemanal();
  const estatisticasState = useMesesEstatisticas();
  const focoState = useFoco();
  const streakToastsState = useStreakToasts(historicoAnualState.historico);

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
                  atualizar={habitosState.atualizar}
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

          {view === 'notes' && (
              <NotesView
                  notas={notasState.notas}
                  loading={notasState.loading}
                  error={notasState.error}
                  criar={notasState.criar}
                  atualizar={notasState.atualizar}
                  excluir={notasState.excluir}
                  fixar={notasState.fixar}
              />
          )}

{view === 'planning' && (
              <PlanningView
                  planejamento={planejamentoState.planejamento}
                  historico={planejamentoState.historico}
                  loading={planejamentoState.loading}
                  error={planejamentoState.error}
                  criar={planejamentoState.criar}
                  atualizarRascunho={planejamentoState.atualizarRascunho}
                  fechar={planejamentoState.fechar}
                  reabrir={planejamentoState.reabrir}
                  concluirItem={planejamentoState.concluirItem}
              />
          )}

          {view === 'statistics' && (
              <StatisticsView
                  meses={estatisticasState.meses}
                  loading={estatisticasState.loading}
                  error={estatisticasState.error}
              />
          )}

          {view === 'focus' && (
              <FocusView
                  sessions={focoState.sessions}
                  loading={focoState.loading}
                  error={focoState.error}
                  criarSessao={focoState.criar}
                  excluirSessao={focoState.excluir}
              />
          )}
        </main>
      </div>
      {isMobile && <MobileTabBar view={view} setView={setView} />}
      <StreakToasts toasts={streakToastsState.toasts} dispensar={streakToastsState.dispensar} />
    </div>
  );
}
