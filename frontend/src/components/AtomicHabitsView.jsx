import { useState } from 'react';
import { MetricCard, LoadingBlock, ErrorBlock } from './Shared';
import { TodayForm } from './TodayForm';
import { WaterChart, HabitsConsistencyGrid, MoodSleepChart } from './AtomicCharts';
import { HistoryTable } from './HistoryTable';
import { fmtDatePT, rangeDays, todayISO } from '../utils/date';
import { WATER_GOAL } from '../constants';

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function AtomicHabitsView({
  registroHoje,
  loadingHoje,
  erroHoje,
  onAtualizarHoje,
  historico,
  loadingHistorico,
  erroHistorico,
  range,
  setRange,
  historicoCompleto,
  loadingCompleto,
  onExcluirRegistro,
}) {
  const days = rangeDays(range);
  const map = {};
  historico.forEach((e) => { map[e.data] = e; });

  const avgWater = average(days.map((d) => map[d]?.agua || 0));
  const studyDays = days.filter((d) => map[d]?.estudos).length;
  const workDays = days.filter((d) => map[d]?.trabalho).length;
  const earlyDays = days.filter((d) => map[d]?.acordarCedo).length;

  return (
    <div className="view-wrap fade-in">
      <header className="page-header page-header-responsive">
        <div>
          <p className="eyebrow">registro diário</p>
          <h1 className="page-title">hábitos atômicos</h1>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">hoje · {fmtDatePT(todayISO())}</h2>
        </div>
        <ErrorBlock text={erroHoje} />
        {loadingHoje ? <LoadingBlock /> : <TodayForm registro={registroHoje} onChange={onAtualizarHoje} />}
      </section>

      <section className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="panel-header">
          <h2 className="panel-title">evolução</h2>
          <div className="range-toggle">
            {[7, 14, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`range-btn ${range === r ? 'range-btn-active' : ''}`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        <ErrorBlock text={erroHistorico} />

        <div className="metrics-grid-small">
          <MetricCard label="água média" value={`${avgWater.toFixed(1)}L`} sub={`meta ${WATER_GOAL}L`} />
          <MetricCard label="dias de estudo" value={studyDays} sub={`de ${range} dias`} />
          <MetricCard label="dias de trabalho" value={workDays} sub={`de ${range} dias`} />
          <MetricCard label="acordou cedo" value={earlyDays} sub={`de ${range} dias`} />
        </div>

        {loadingHistorico ? (
          <LoadingBlock text="carregando gráficos..." />
        ) : (
          <>
            <WaterChart historico={historico} dias={range} />
            <HabitsConsistencyGrid historico={historico} dias={range} />
            <MoodSleepChart historico={historico} dias={range} />
          </>
        )}
      </section>

      <section className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="panel-header">
          <h2 className="panel-title">histórico completo</h2>
        </div>
        {loadingCompleto ? (
          <LoadingBlock text="carregando histórico..." />
        ) : (
          <HistoryTable historico={historicoCompleto} onDelete={onExcluirRegistro} />
        )}
      </section>
    </div>
  );
}
