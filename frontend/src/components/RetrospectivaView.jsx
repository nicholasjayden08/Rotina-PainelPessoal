/**
 * Retrospectiva anual em tela cheia, no formato de "stories": uma
 * estatística por tela, navegação por clique, botões ou setas do teclado
 * (Esc fecha). Os dados vêm de /retrospectiva (useRetrospectiva);
 * montarSlides() transforma a resposta em telas e pula as que não têm
 * dado suficiente (dia da semana, mês e sono podem vir null).
 * Tudo observacional: contagens e médias, sem inferir causa.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRetrospectiva } from '../hooks/useRetrospectiva';
import { COLORS } from '../constants';

const COR_HABITO = {
    'estudos': COLORS.success,
    'trabalho': COLORS.info,
    'acordar cedo': COLORS.warning,
    'academia': COLORS.danger,
};

const LITROS_POR_GARRAFA = 2;

function fmtNum(n, max = 1) {
    return n.toLocaleString('pt-BR', { maximumFractionDigits: max });
}

function fmtHoras(horas) {
    const total = Math.round(horas * 60);
    return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`;
}

// '2026-09-29' -> '29/09'
function fmtDiaMes(iso) {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
}

function BarrasHabitos({ habitos, diasRegistrados }) {
    return (
        <div style={{ marginTop: 28, textAlign: 'left' }}>
            {habitos.map((h) => {
                const pct = diasRegistrados > 0 ? (h.diasFeitos / diasRegistrados) * 100 : 0;
                return (
                    <div key={h.nome} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.textBody, marginBottom: 4 }}>
                            <span>{h.nome}</span>
                            <span style={{ color: COLORS.textMutedLight }}>
                                {h.diasFeitos} dias · maior sequência {h.maiorSequencia}
                            </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: COLORS.trackBg }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: COR_HABITO[h.nome] || COLORS.accent }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ResumoFinal({ itens }) {
    return (
        <div className="retro-resumo">
            {itens.map((i) => (
                <div key={i.label} className="retro-resumo-item">
                    <span className="retro-resumo-valor">{i.valor}</span>
                    <span className="retro-resumo-label">{i.label}</span>
                </div>
            ))}
        </div>
    );
}

function montarSlides(d) {
    if (d.diasRegistrados === 0) {
        return [{
            id: 'vazio',
            eyebrow: `retrospectiva ${d.ano}`,
            big: '0',
            cor: COLORS.textMutedLight,
            texto: 'nenhum registro neste ano ainda',
        }];
    }

    const slides = [];
    const campeao = d.habitos.find((h) => h.diasFeitos > 0);

    slides.push({
        id: 'intro',
        eyebrow: 'sua retrospectiva',
        big: String(d.ano),
        cor: COLORS.accent,
        texto: 'um ano de rotina, em números',
        nota: 'clique ou use as setas para avançar',
    });

    slides.push({
        id: 'dias',
        eyebrow: 'você registrou',
        big: String(d.diasRegistrados),
        cor: COLORS.info,
        texto: `dias em ${d.ano}`,
        nota: d.maiorSequenciaRegistros > 1
            ? `maior sequência registrando: ${d.maiorSequenciaRegistros} dias`
            : null,
    });

    if (d.agua.totalLitros > 0) {
        const garrafas = Math.round(d.agua.totalLitros / LITROS_POR_GARRAFA);
        slides.push({
            id: 'agua',
            eyebrow: 'você bebeu',
            big: `${fmtNum(d.agua.totalLitros)}L`,
            cor: COLORS.info,
            texto: `${fmtNum(garrafas, 0)} garrafas de ${LITROS_POR_GARRAFA}L`,
            nota: `${d.agua.diasNaMeta} dias batendo a meta de água`,
        });
    }

    if (campeao) {
        slides.push({
            id: 'habitos',
            eyebrow: 'seu hábito mais constante',
            big: campeao.nome,
            textoGrande: true,
            cor: COR_HABITO[campeao.nome] || COLORS.success,
            texto: `${campeao.diasFeitos} dias feitos, com sequência de até ${campeao.maiorSequencia}`,
            extra: <BarrasHabitos habitos={d.habitos} diasRegistrados={d.diasRegistrados} />,
        });
    }

    if (d.diaSemanaMaisForte) {
        slides.push({
            id: 'dia-semana',
            eyebrow: 'seu dia mais forte',
            big: d.diaSemanaMaisForte.nome,
            textoGrande: true,
            cor: COLORS.warning,
            texto: `em média ${fmtNum(d.diaSemanaMaisForte.mediaHabitos, 2)} hábitos feitos por dia`,
        });
    }

    if (d.mesMaisConsistente) {
        slides.push({
            id: 'mes',
            eyebrow: 'seu mês mais consistente',
            big: d.mesMaisConsistente.nome,
            textoGrande: true,
            cor: COLORS.success,
            texto: `em média ${fmtNum(d.mesMaisConsistente.mediaHabitos, 2)} hábitos por dia registrado`,
        });
    }

    if (d.sono) {
        const notas = [];
        if (d.sono.horarioMedioDormir && d.sono.horarioMedioAcordar) {
            notas.push(`horário médio: dorme ${d.sono.horarioMedioDormir} · acorda ${d.sono.horarioMedioAcordar}`);
        }
        if (d.sono.noiteMaisLonga) {
            notas.push(`noite mais longa: ${fmtDiaMes(d.sono.noiteMaisLonga.data)} (${fmtHoras(d.sono.noiteMaisLonga.horas)})`);
        }
        slides.push({
            id: 'sono',
            eyebrow: 'seu sono',
            big: d.sono.mediaHoras ? fmtHoras(d.sono.mediaHoras) : (d.sono.horarioMedioDormir || d.sono.horarioMedioAcordar),
            cor: COLORS.accent,
            texto: d.sono.mediaHoras ? 'de sono por noite, em média' : 'horário médio registrado',
            nota: notas.join('\n') || null,
        });
    }

    const itens = [
        { label: 'dias registrados', valor: String(d.diasRegistrados) },
        { label: 'de água', valor: `${fmtNum(d.agua.totalLitros)}L` },
    ];
    if (campeao) itens.push({ label: 'hábito campeão', valor: campeao.nome.charAt(0).toUpperCase() + campeao.nome.slice(1) });
    if (d.mesMaisConsistente) itens.push({ label: 'melhor mês', valor: d.mesMaisConsistente.nome });
    if (d.sono && d.sono.mediaHoras) itens.push({ label: 'sono médio', valor: fmtHoras(d.sono.mediaHoras) });
    itens.push({ label: 'maior sequência registrando', valor: `${d.maiorSequenciaRegistros} dias` });

    slides.push({
        id: 'resumo',
        eyebrow: `${d.ano} em resumo`,
        cor: COLORS.textPrimary,
        extra: <ResumoFinal itens={itens} />,
    });

    return slides;
}

export function RetrospectivaView({ ano, onClose }) {
    const { dados, loading, error } = useRetrospectiva(ano);
    const [idx, setIdx] = useState(0);

    const slides = useMemo(() => (dados ? montarSlides(dados) : []), [dados]);

    const proximo = useCallback(() => setIdx((i) => Math.min(i + 1, slides.length - 1)), [slides.length]);
    const anterior = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') proximo();
            else if (e.key === 'ArrowLeft') anterior();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [proximo, anterior, onClose]);

    const slide = slides[idx];

    return (
        <div className="retro-overlay">
            {slides.length > 0 && (
                <div className="retro-progress">
                    {slides.map((s, i) => (
                        <div key={s.id} className={`retro-progress-seg${i <= idx ? ' done' : ''}`} />
                    ))}
                </div>
            )}

            <button className="icon-btn retro-close" onClick={onClose} aria-label="fechar">
                <X size={16} />
            </button>

            <div className="retro-stage" onClick={proximo}>
                {loading && <p className="retro-sub">carregando retrospectiva...</p>}
                {error && <p className="retro-sub" style={{ color: COLORS.danger }}>{error}</p>}

                {slide && (
                    <div key={slide.id} className="retro-slide fade-in">
                        <p className="retro-eyebrow">{slide.eyebrow}</p>
                        {slide.big && (
                            <h2 className={`retro-big${slide.textoGrande ? ' retro-big-text' : ''}`} style={{ color: slide.cor }}>
                                {slide.big}
                            </h2>
                        )}
                        {slide.texto && <p className="retro-sub">{slide.texto}</p>}
                        {slide.nota && <p className="retro-note">{slide.nota}</p>}
                        {slide.extra}
                    </div>
                )}
            </div>

            {slides.length > 1 && (
                <div className="retro-nav">
                    <button
                        className="icon-btn"
                        onClick={(e) => { e.stopPropagation(); anterior(); }}
                        disabled={idx === 0}
                        aria-label="anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="retro-count">{idx + 1} / {slides.length}</span>
                    <button
                        className="icon-btn"
                        onClick={(e) => { e.stopPropagation(); proximo(); }}
                        disabled={idx === slides.length - 1}
                        aria-label="próximo"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}