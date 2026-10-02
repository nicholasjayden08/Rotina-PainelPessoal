/**
 * Tela de estatísticas mensais: seletor de mês + resumo (useResumoEstatisticas)
 * + destaques do mês (melhor dia/semana, com o porquê) + insights automáticos
 * (useInsights). StatBar é a barrinha de progresso reaproveitada pra cada
 * hábito na seção "consistência de hábitos", opcionalmente com a variação em
 * pontos percentuais vs o mês anterior (só aparece se o mês anterior existir e
 * os dois meses tiverem pelo menos MIN_DIAS_COMPARACAO dias registrados).
 * Os cards de água, sono e horários também mostram a variação vs o mês
 * anterior, mas só quando ela passa de um limiar (LIMIAR_*), pra não poluir.
 * INSIGHT_CORES mapeia o tipo do insight (sono/humor/agua/dia_semana) pra cor
 * da barrinha lateral de cada item.
 * O botão "retrospectiva" abre a RetrospectivaView em tela cheia, do ano do
 * mês selecionado (ou do ano atual, se ainda não há mês selecionado).
 */

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MonthSelector } from './MonthSelector';
import { RetrospectivaView } from './RetrospectivaView';
import { LoadingBlock, ErrorBlock, MetricCard } from './Shared';
import { useResumoEstatisticas } from '../hooks/useEstatisticas';
import { useInsights } from '../hooks/useInsights';
import { COLORS } from '../constants';
import { fmtDateLabel, fmtDatePT } from '../utils/date';

const MIN_DIAS_COMPARACAO = 5;

function fmtVariacao(atual, anterior, nomeMesAnterior) {
    if (anterior === undefined || anterior === null) return null;
    const diff = Math.round(atual - anterior);
    if (diff === 0) return `igual a ${nomeMesAnterior}`;
    return `${diff > 0 ? '+' : '-'}${Math.abs(diff)} pts vs ${nomeMesAnterior}`;
}

const LIMIAR_AGUA_LITROS = 0.3;
const LIMIAR_SONO_MINUTOS = 15;
const LIMIAR_HORARIO_MINUTOS = 20;

function hhmmParaMinutos(txt) {
    const m = /^(\d{2}):(\d{2})$/.exec(txt || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function duracaoParaMinutos(txt) {
    const m = /^(\d+)h(\d{2})$/.exec(txt || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function fmtMinutos(min) {
    const abs = Math.abs(min);
    if (abs < 60) return `${abs} min`;
    return `${Math.floor(abs / 60)}h${String(abs % 60).padStart(2, '0')}`;
}

function variacaoAgua(atual, anterior, nomeMesAnterior) {
    const diff = Math.round((atual - anterior) * 100) / 100;
    if (Math.abs(diff) < LIMIAR_AGUA_LITROS) return null;
    return `${diff > 0 ? '+' : '-'}${parseFloat(Math.abs(diff).toFixed(2))}L vs ${nomeMesAnterior}`;
}

function variacaoSono(atual, anterior, nomeMesAnterior) {
    const a = duracaoParaMinutos(atual);
    const b = duracaoParaMinutos(anterior);
    if (a === null || b === null) return null;
    const diff = a - b;
    if (Math.abs(diff) < LIMIAR_SONO_MINUTOS) return null;
    return `${diff > 0 ? '+' : '-'}${fmtMinutos(diff)} vs ${nomeMesAnterior}`;
}

// diferença circular: 23:50 vs 00:20 = 30 min mais cedo, não 23h
function variacaoHorario(atual, anterior, nomeMesAnterior) {
    const a = hhmmParaMinutos(atual);
    const b = hhmmParaMinutos(anterior);
    if (a === null || b === null) return null;
    const diff = ((a - b + 720 + 1440) % 1440) - 720;
    if (Math.abs(diff) < LIMIAR_HORARIO_MINUTOS) return null;
    return `${fmtMinutos(diff)} ${diff > 0 ? 'mais tarde' : 'mais cedo'} que em ${nomeMesAnterior}`;
}

function StatBar({ label, dias, percentual, variacao, color = COLORS.success }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                    {variacao && <span style={{ fontSize: 11, marginRight: 10 }}>{variacao}</span>}
                    {dias} dias · {percentual}%
                </span>
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
    dia_semana: COLORS.accent,
};

function DestaqueBloco({ titulo, dataLabel, motivos }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textBody }}>{titulo}</span>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        background: COLORS.cellInactive,
                        padding: '4px 10px',
                        borderRadius: 6,
                    }}
                >
                    {dataLabel}
                </span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5, margin: 0 }}>
                {motivos.length > 0
                    ? `Você ${motivos.join(', ')}.`
                    : 'sem detalhes suficientes pra explicar o porquê.'}
            </p>
        </div>
    );
}

function DestaquesCard({ melhorDia, melhorSemana }) {
    if (!melhorDia && !melhorSemana) return null;

    return (
        <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
                <h2 className="panel-title">destaques do mês</h2>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {melhorDia && (
                    <DestaqueBloco
                        titulo="melhor dia"
                        dataLabel={fmtDateLabel(melhorDia.data)}
                        motivos={melhorDia.motivos}
                    />
                )}
                {melhorDia && melhorSemana && (
                    <div style={{ height: 1, background: COLORS.cellInactive }} />
                )}
                {melhorSemana && (
                    <DestaqueBloco
                        titulo="melhor semana"
                        dataLabel={`${fmtDatePT(melhorSemana.inicio)} – ${fmtDatePT(melhorSemana.fim)}`}
                        motivos={melhorSemana.motivos}
                    />
                )}
            </div>
        </section>
    );
}

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
    const [retroAberta, setRetroAberta] = useState(false);
    const [ano, mes] = selectedMonth ? selectedMonth.split('-').map(Number) : [];
    const resumoState = useResumoEstatisticas(ano, mes);
    const insightsState = useInsights(ano, mes);

    const mesAnterior = ano && mes ? (mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 }) : null;
    const entradaAnterior = mesAnterior
        ? meses.find((m) => Number(m.ano) === mesAnterior.ano && Number(m.mes) === mesAnterior.mes)
        : null;
    const resumoAnteriorState = useResumoEstatisticas(entradaAnterior?.ano, entradaAnterior?.mes);

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
    const rAnterior = entradaAnterior && !resumoAnteriorState.loading ? resumoAnteriorState.resumo : null;
    const nomeMesAnterior = entradaAnterior ? entradaAnterior.label.split(' ')[0].toLowerCase() : '';
    const comparavel = Boolean(
        r && rAnterior
        && r.diasRegistrados >= MIN_DIAS_COMPARACAO
        && rAnterior.diasRegistrados >= MIN_DIAS_COMPARACAO
    );
    const variacao = (atual, anterior) => (comparavel ? fmtVariacao(atual, anterior, nomeMesAnterior) : null);
    const varAgua = comparavel ? variacaoAgua(r.mediaAgua, rAnterior.mediaAgua, nomeMesAnterior) : null;
    const varSono = comparavel ? variacaoSono(r.mediaSono, rAnterior.mediaSono, nomeMesAnterior) : null;
    const varDormir = comparavel ? variacaoHorario(r.mediaDormiAs, rAnterior.mediaDormiAs, nomeMesAnterior) : null;
    const varAcordar = comparavel ? variacaoHorario(r.mediaAcordeiAs, rAnterior.mediaAcordeiAs, nomeMesAnterior) : null;

    return (
        <div className="view-wrap fade-in">
            <header className="page-header page-header-responsive">
                <div>
                    <p className="eyebrow">análise</p>
                    <h1 className="page-title">estatísticas</h1>
                </div>
                <button
                    className="secondary-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setRetroAberta(true)}
                >
                    <Sparkles size={14} /> retrospectiva
                </button>
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
                            sub={varAgua ? `por dia registrado · ${varAgua}` : 'por dia registrado'}
                        />
                        <MetricCard
                            label="humor predominante"
                            value={r.humorPredominante}
                            sub="no mês"
                        />
                        <MetricCard
                            label="média de sono"
                            value={r.mediaSono}
                            sub={varSono ? `horas por noite · ${varSono}` : 'horas por noite'}
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
                            sub={varAcordar || 'baseado no mês'}
                        />
                    </div>

                    <section className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">consistência de hábitos</h2>
                            <span className="panel-sub">sobre dias registrados</span>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <StatBar label="estudos" dias={r.diasEstudo} percentual={r.percentualEstudo} variacao={variacao(r.percentualEstudo, rAnterior?.percentualEstudo)} color={COLORS.success} />
                            <StatBar label="trabalho" dias={r.diasTrabalho} percentual={r.percentualTrabalho} variacao={variacao(r.percentualTrabalho, rAnterior?.percentualTrabalho)} color={COLORS.info} />
                            <StatBar label="academia" dias={r.diasAcademia} percentual={r.percentualAcademia} variacao={variacao(r.percentualAcademia, rAnterior?.percentualAcademia)} color={COLORS.danger} />
                            <StatBar label="acordou cedo" dias={r.diasAcordouCedo} percentual={r.percentualAcordouCedo} variacao={variacao(r.percentualAcordouCedo, rAnterior?.percentualAcordouCedo)} color={COLORS.warning} />
                        </div>
                    </section>

                    <DestaquesCard
                        melhorDia={r.melhorDia}
                        melhorSemana={r.melhorSemana}
                    />

                    <InsightsCard
                        insights={insightsState.insights}
                        dadosSuficientes={insightsState.dadosSuficientes}
                        loading={insightsState.loading}
                    />
                </>
            )}

            {retroAberta && (
                <RetrospectivaView
                    ano={ano || new Date().getFullYear()}
                    onClose={() => setRetroAberta(false)}
                />
            )}
        </div>
    );
}