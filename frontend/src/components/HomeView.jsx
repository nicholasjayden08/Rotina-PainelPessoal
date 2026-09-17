/**
 * Dashboard principal — agrega dados de tarefas, hábitos diários,
 * registro de hoje e histórico anual, todos calculados aqui em cima das
 * props brutas (streak, % de hábitos feitos, tarefa mais urgente, etc).
 * Os dois banners de alerta (atrasada / vence em breve) usam
 * getTarefaMaisUrgente / getTarefaProximaAVencer de utils/tarefas —
 * só um dos dois aparece por vez (prioriza atrasada).
 */

import { Flame, Check, Droplet, Calendar, AlertTriangle } from 'lucide-react';
import { MetricCard, EmptyHint, LoadingBlock } from './Shared';
import { WaterRing } from './WaterRing';
import { YearHeatmap } from './YearHeatmap';
import { computeStreak } from '../utils/streak';
import { getTarefaMaisUrgente, getTarefaProximaAVencer } from '../utils/tarefas';
import { fmtDatePT, rangeDays } from '../utils/date';
import { HomeAlerts} from "./HomeAlerts";
import { WATER_GOAL, COLORS } from '../constants';

export function HomeView({ tarefas, habitos, registroHoje, historicoAnual, onAtualizarAgua, setView, loadingResumo }) {
  const pendentes = tarefas.filter((t) => t.status !== 'CONCLUIDO');
  const altas = pendentes.filter((t) => t.prioridade === 'ALTA');
  const feitos = habitos.filter((h) => h.feito).length;
  const total = habitos.length;
  const pctHabitos = total ? Math.round((feitos / total) * 100) : 0;
  const agua = registroHoje?.agua || 0;
  const streak = computeStreak(historicoAnual);
  const proximoPasso = getTarefaMaisUrgente(tarefas);
  const proximaAVencer = !proximoPasso ? getTarefaProximaAVencer(tarefas) : null;
  const registrouHabitosHoje =
      !!registroHoje &&
      (
          registroHoje.humor !== null ||
          registroHoje.sono !== null ||
          registroHoje.dormiAs !== null ||
          registroHoje.acordeiAs !== null ||
          registroHoje.acordarCedo ||
          registroHoje.estudos ||
          registroHoje.trabalho ||
          registroHoje.academia
      );

  const dataStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="view-wrap fade-in">
      <header className="page-header page-header-responsive">
        <div>
          <p className="eyebrow">{dataStr}</p>
          <h1 className="page-title">bom te ver de volta</h1>
        </div>
        <div className="streak-badge">
          <Flame size={16} color={COLORS.warning} strokeWidth={2} />
          <span>{streak} {streak === 1 ? 'dia' : 'dias'} de streak</span>
        </div>
      </header>

      {proximoPasso && (
          <button className="overdue-banner" onClick={() => setView('tasks')}>
            <AlertTriangle size={16} color={COLORS.danger} strokeWidth={2} />
            <div className="overdue-banner-text">
              <span className="overdue-banner-label">próximo passo</span>
              <span className="overdue-banner-task">
              {proximoPasso.nome} — atrasada há {proximoPasso.diasAtraso} {proximoPasso.diasAtraso === 1 ? 'dia' : 'dias'}
            </span>
            </div>
          </button>
      )}

      {proximaAVencer && (
          <button className="overdue-banner overdue-banner-warning" onClick={() => setView('tasks')}>
            <AlertTriangle size={16} color={COLORS.warning} strokeWidth={2} />
            <div className="overdue-banner-text">
              <span className="overdue-banner-label">de olho no prazo</span>
              <span className="overdue-banner-task">
              {proximaAVencer.nome} — {proximaAVencer.diasRestantes === 0 ? 'vence hoje' : proximaAVencer.diasRestantes === 1 ? 'vence amanhã' : `vence em ${proximaAVencer.diasRestantes} dias`}
            </span>
            </div>
          </button>
      )}

      <div className="metrics-grid">
        <MetricCard label="tarefas pendentes" value={pendentes.length} sub={`de ${tarefas.length} no total`} onClick={() => setView('tasks')} />
        <MetricCard label="hábitos de hoje" value={`${feitos}/${total}`} sub={`${pctHabitos}% concluído`} onClick={() => setView('daily')} />
        <MetricCard label="água hoje" value={`${agua.toFixed ? agua.toFixed(1) : agua}L`} sub={`meta: ${WATER_GOAL}L`} onClick={() => setView('atomic')} />
        <MetricCard label="streak atual" value={streak} sub="dias consecutivos" />
      </div>

      <div className="home-grid">
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">água de hoje</h2>
            <Droplet size={16} color={COLORS.info} strokeWidth={1.75} />
          </div>
          {registroHoje ? (
            <WaterRing value={agua} onChange={onAtualizarAgua} />
          ) : (
            <LoadingBlock />
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">hábitos de hoje</h2>
          </div>
          {loadingResumo ? (
            <LoadingBlock />
          ) : habitos.length === 0 ? (
            <EmptyHint text="nenhum hábito cadastrado ainda" />
          ) : (
            <div className="mini-list">
              {habitos.slice(0, 5).map((h) => (
                <div key={h.id} className="mini-item">
                  <span className={`habit-check-box ${h.feito ? 'habit-check-box-done' : ''}`}>
                        {h.feito && <Check size={11} strokeWidth={3} color={COLORS.textInverse} />}
                  </span>
                  <span className="mini-item-text" style={{ textDecoration: h.feito ? 'line-through' : 'none', opacity: h.feito ? 0.55 : 1 }}>
                    {h.nome}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-full">
          <div className="panel-header">
            <h2 className="panel-title">consistência anual</h2>
          </div>
          <YearHeatmap historico={historicoAnual} />
        </section>

        <section className="panel panel-full">
          <div className="panel-header">
            <h2 className="panel-title">tarefas de prioridade alta</h2>
          </div>
          {altas.length === 0 ? (
            <EmptyHint text="nenhuma tarefa de alta prioridade pendente. boa!" />
          ) : (
            <div className="mini-list">
              {altas.map((t) => (
                <div key={t.id} className="mini-item">
                  <span className="dot" style={{ background: COLORS.danger }} />
                  <span className="mini-item-text">{t.nome}</span>
                  {t.prazo && (
                    <span className="mini-item-meta">
                      <Calendar size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                      {fmtDatePT(t.prazo)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <HomeAlerts
            aguaAtual={agua}
            registrouHoje={registrouHabitosHoje}
            streak={streak}
            habitosFeitos={feitos}
            habitosTotal={total}
            onAbrirHabitosAtomicos={() => setView('atomic')}
            onAbrirHabitosDiarios={() => setView('daily')}
        />
      </div>
    </div>
  );
}
