/**
 * Tela de estatísticas mensais: seletor de mês + resumo (useResumoEstatisticas)
 * + insights automáticos (useInsights). StatBar é a barrinha de progresso
 * reaproveitada pra cada hábito na seção "consistência de hábitos".
 * INSIGHT_CORES mapeia o tipo do insight (sono/humor/agua) pra cor da
 * barrinha lateral de cada item.
 */

import { useEffect, useState } from 'react';
import { MonthSelector } from './MonthSelector';
import { LoadingBlock, ErrorBlock, MetricCard } from './Shared';
import { useResumoEstatisticas } from '../hooks/useEstatisticas';
import { useInsights } from '../hooks/useInsights';
import { COLORS } from '../constants';

function StatBar({ label, dias, percentual, color = COLORS.success }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>{dias} dias · {percentual}%</span>
            </div>
            <div style={{ height: 6, background: COLORS.cellInactive, borderRadius: 4 }}>
                <div style={{ height: 6, background: color, borderRadius: 4, width: `${Math.min(percentual, 100)}%`, transition: 'width 0.4s ease' }} />
            </div>
        </div>
    );
}

const INSIGHT_CORES = {
    sono: COLORS.info,
    humor: COLORS.warning,
    agua: COLORS.success,
};

function InsightsCard({ insights, dadosSuficientes, loading }) {
    if (loading) return null;

    return (
        <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
                <h2 className="panel-title">insights do mês</h2>
            </div>
            <div style={{ marginTop: 16 }}>
                {!dadosSuficientes && (
                    <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>
                        ainda não há registros suficientes para gerar insights confiáveis esse mês.
                    </p>
                )}
                {dadosSuficientes && insights.length === 0 && (
                    <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>
                        nenhum padrão relevante encontrado nos dados desse mês.
                    </p>
                )}
                {dadosSuficientes && insights.map((insight, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            gap: 10,
                            padding: '10px 0',
                            borderBottom: i < insights.length - 1 ? `1px solid ${COLORS.cellInactive}` : 'none',
                        }}
                    >
                        <span style={{ width: 4, borderRadius: 2, background: INSIGHT_CORES[insight.tipo] || COLORS.success, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: COLORS.textBody, lineHeight: 1.5 }}>{insight.mensagem}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function StatisticsView({ meses, loading, error }) {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [ano, mes] = selectedMonth ? selectedMonth.split('-').map(Number) : [];
    const resumoState = useResumoEstatisticas(ano, mes);
    const insightsState = useInsights(ano, mes);

    useEffect(() => {
        if (!selectedMonth && meses.length > 0) {
            const primeiro = meses[0];
            setSelectedMonth(`${primeiro.ano}-${String(primeiro.mes).padStart(2, '0')}`);
        }
    }, [meses, selectedMonth]);

    const options = meses.map((m) => ({
        value: `${m.ano}-${String(m.mes).padStart(2, '0')}`,
        label: m.label,
    }));

    const r = resumoState.resumo;

    return (
        <div className="view-wrap fade-in">
            <header className="page-header page-header-responsive">
                <div>
                    <p className="eyebrow">análise</p>
                    <h1 className="page-title">estatísticas</h1>
                </div>
            </header>

            <section className="panel" style={{ marginBottom: 16 }}>
                <div className="panel-header">
                    {loading ? (
                        <LoadingBlock text="carregando meses..." />
                    ) : (
                        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} options={options} />
                    )}
                </div>
                <ErrorBlock text={error} />
            </section>

            {resumoState.loading && <LoadingBlock text="carregando estatísticas..." />}
            <ErrorBlock text={resumoState.error} />

            {!resumoState.loading && r && (
                <>
                    <div className="metrics-grid" style={{ marginBottom: 16 }}>
                        <MetricCard
                            label="dias registrados"
                            value={`${r.diasRegistrados}/${r.totalDiasMes}`}
                            sub="dias com registro"
                        />
                        <MetricCard
                            label="média de água"
                            value={`${r.mediaAgua}L`}
                            sub="por dia registrado"
                        />
                        <MetricCard
                            label="humor predominante"
                            value={r.humorPredominante}
                            sub="no mês"
                        />
                        <MetricCard
                            label="média de sono"
                            value={r.mediaSono}
                            sub="horas por noite"
                        />
                    </div>

                    <div className="metrics-grid" style={{ marginBottom: 16 }}>
                        <MetricCard
                            label="horário médio de dormir"
                            value={r.mediaDormiAs}
                            sub="baseado no mês"
                        />
                        <MetricCard
                            label="horário médio de acordar"
                            value={r.mediaAcordeiAs}
                            sub="baseado no mês"
                        />
                    </div>

                    <section className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">consistência de hábitos</h2>
                            <span className="panel-sub">sobre dias registrados</span>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <StatBar label="estudos" dias={r.diasEstudo} percentual={r.percentualEstudo} color={COLORS.success} />
                            <StatBar label="trabalho" dias={r.diasTrabalho} percentual={r.percentualTrabalho} color={COLORS.info} />
                            <StatBar label="academia" dias={r.diasAcademia} percentual={r.percentualAcademia} color={COLORS.danger} />
                            <StatBar label="acordou cedo" dias={r.diasAcordouCedo} percentual={r.percentualAcordouCedo} color={COLORS.warning} />
                        </div>
                    </section>

                    <InsightsCard
                        insights={insightsState.insights}
                        dadosSuficientes={insightsState.dadosSuficientes}
                        loading={insightsState.loading}
                    />
                </>
            )}
        </div>
    );
}