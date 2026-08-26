import { useEffect, useRef, useState } from 'react';
import { CalendarRange, Check, Pencil, Lock } from 'lucide-react';
import { ModalShell, EmptyHint, LoadingBlock, ErrorBlock } from './Shared';
import { fmtDatePT } from '../utils/date';

function fimDaSemana(inicioISO) {
    const d = new Date(inicioISO + 'T00:00:00');
    d.setDate(d.getDate() + 6);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function rotuloSemana(inicioISO) {
    return `${fmtDatePT(inicioISO)} a ${fmtDatePT(fimDaSemana(inicioISO))}`;
}

export function PlanningView({ planejamento, historico, loading, error, criar, atualizarRascunho, fechar, reabrir, concluirItem }) {
    const [texto, setTexto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [confirmandoReabrir, setConfirmandoReabrir] = useState(false);
    const [erroAcao, setErroAcao] = useState(null);
    const emAndamento = useRef(false);

    useEffect(() => {
        if (planejamento?.status === 'RASCUNHO') {
            setTexto(planejamento.textoBruto || '');
        } else if (!planejamento) {
            setTexto('');
        }
    }, [planejamento?.id, planejamento?.status]);

    async function handleCriar() {
        if (emAndamento.current) return;
        emAndamento.current = true;
        setSalvando(true);
        setErroAcao(null);
        try {
            await criar(texto);
        } catch (e) {
            setErroAcao(e.message);
        } finally {
            emAndamento.current = false;
            setSalvando(false);
        }
    }

    async function handleSalvarRascunho() {
        if (emAndamento.current) return;
        emAndamento.current = true;
        setSalvando(true);
        setErroAcao(null);
        try {
            await atualizarRascunho(planejamento.id, texto);
        } catch (e) {
            setErroAcao(e.message);
        } finally {
            emAndamento.current = false;
            setSalvando(false);
        }
    }

    async function handleFechar() {
        if (emAndamento.current) return;
        emAndamento.current = true;
        setSalvando(true);
        setErroAcao(null);
        try {
            await atualizarRascunho(planejamento.id, texto);
            await fechar(planejamento.id);
        } catch (e) {
            setErroAcao(e.message);
        } finally {
            emAndamento.current = false;
            setSalvando(false);
        }
    }

    async function handleConfirmarReabrir() {
        if (emAndamento.current) return;
        emAndamento.current = true;
        setSalvando(true);
        setErroAcao(null);
        try {
            await reabrir(planejamento.id);
            setConfirmandoReabrir(false);
        } catch (e) {
            setErroAcao(e.message);
        } finally {
            emAndamento.current = false;
            setSalvando(false);
        }
    }

    return (
        <div className="view-wrap fade-in">
            <header className="page-header page-header-responsive">
                <div>
                    <p className="eyebrow">organização</p>
                    <h1 className="page-title">planejamento semanal</h1>
                </div>
            </header>

            <ErrorBlock text={error || erroAcao} />

            {loading ? (
                <LoadingBlock text="carregando planejamento..." />
            ) : (
                <>
                    <div className="planning-card">
                        <div className="planning-card-header">
                            <CalendarRange size={14} color="#5B9FED" />
                            <span className="planning-week-label">
                                {planejamento ? rotuloSemana(planejamento.dataInicioSemana) : 'semana atual'}
                            </span>
                            {planejamento?.status === 'FECHADO' && (
                                <span className="tag-neutral planning-status-tag">
                                    <Lock size={11} /> fechado
                                </span>
                            )}
                        </div>

                        {!planejamento && (
                            <>
                                <textarea
                                    autoFocus
                                    className="input planning-textarea"
                                    placeholder={'uma meta por linha, ex:\nestudar spring 5x\nacademia 3x\nler 1 capítulo por dia'}
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                />
                                <div className="modal-actions">
                                    <button className="primary-btn" onClick={handleCriar} disabled={salvando || !texto.trim()}>
                                        {salvando ? 'criando...' : 'criar planejamento da semana'}
                                    </button>
                                </div>
                            </>
                        )}

                        {planejamento?.status === 'RASCUNHO' && (
                            <>
                                <textarea
                                    className="input planning-textarea"
                                    placeholder="uma meta por linha"
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                />
                                <div className="modal-actions">
                                    <button className="secondary-btn" onClick={handleSalvarRascunho} disabled={salvando}>
                                        salvar rascunho
                                    </button>
                                    <button className="primary-btn" onClick={handleFechar} disabled={salvando || !texto.trim()}>
                                        <Lock size={14} /> fechar planejamento
                                    </button>
                                </div>
                            </>
                        )}

                        {planejamento?.status === 'FECHADO' && (
                            <>
                                {planejamento.itens.length === 0 ? (
                                    <EmptyHint text="nenhuma meta registrada nessa semana." />
                                ) : (
                                    <div className="task-list planning-item-list">
                                        {planejamento.itens.map((item) => (
                                            <button
                                                key={item.id}
                                                className="habit-row planning-item-row"
                                                onClick={() => concluirItem(item.id)}
                                            >
                                                <span className={`planning-check ${item.concluida ? 'planning-check-done' : ''}`}>
                                                    {item.concluida && <Check size={13} />}
                                                </span>
                                                <span className={`planning-item-text ${item.concluida ? 'planning-item-text-done' : ''}`}>
                                                    {item.texto}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button className="secondary-btn" onClick={() => setConfirmandoReabrir(true)}>
                                        <Pencil size={14} /> editar metas
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <h2 className="planning-history-title">histórico</h2>
                    {historico.length === 0 ? (
                        <EmptyHint text="nenhum planejamento anterior ainda." />
                    ) : (
                        <div className="planning-history-list">
                            {historico.map((p) => (
                                <div key={p.id} className="planning-card planning-history-card">
                                    <div className="planning-card-header">
                                        <CalendarRange size={13} color="#5A5F68" />
                                        <span className="planning-week-label planning-week-label-muted">
                                            {rotuloSemana(p.dataInicioSemana)}
                                        </span>
                                    </div>
                                    {p.status === 'FECHADO' && p.itens.length > 0 ? (
                                        <ul className="planning-history-items">
                                            {p.itens.map((item) => (
                                                <li key={item.id} className={item.concluida ? 'planning-history-item-done' : ''}>
                                                    {item.concluida ? '✓' : '·'} {item.texto}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mini-item-meta">sem metas fechadas nessa semana</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {confirmandoReabrir && (
                <ModalShell title="editar metas fechadas?" onClose={() => setConfirmandoReabrir(false)}>
                    <p className="planning-confirm-text">
                        as metas dessa semana já foram fechadas e têm progresso marcado. editar agora vai reabrir
                        o texto pra edição e o progresso dos checkboxes será perdido. quer continuar?
                    </p>
                    <div className="modal-actions">
                        <button className="secondary-btn" onClick={() => setConfirmandoReabrir(false)}>cancelar</button>
                        <button className="primary-btn" onClick={handleConfirmarReabrir} disabled={salvando}>
                            {salvando ? 'reabrindo...' : 'sim, editar'}
                        </button>
                    </div>
                </ModalShell>
            )}
        </div>
    );
}