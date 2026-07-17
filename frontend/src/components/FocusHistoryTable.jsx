import { Trash2 } from 'lucide-react';
import { EmptyHint } from './Shared';
import { fmtDatePT } from '../utils/date';

function fmtHoraSessao(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function FocusHistoryTable({ sessions, onDelete }) {
    if (sessions.length === 0) return <EmptyHint text="nenhuma sessão concluída ainda." />;

    return (
        <div className="history-table-wrap">
            <table className="table">
                <thead>
                <tr>
                    <th className="th">data</th>
                    <th className="th">horário</th>
                    <th className="th">objetivo</th>
                    <th className="th">duração</th>
                    <th className="th"></th>
                </tr>
                </thead>
                <tbody>
                {sessions.map((s) => (
                    <tr key={s.id}>
                        <td className="td">{fmtDatePT(s.concluidaEm?.slice(0, 10))}</td>
                        <td className="td">{fmtHoraSessao(s.concluidaEm)}</td>
                        <td className="td">{s.titulo || 'Sessão de foco'}</td>
                        <td className="td">{s.duracaoMinutos} min</td>
                        <td className="td">
                            <button className="icon-btn" onClick={() => onDelete(s.id)} aria-label="excluir sessão">
                                <Trash2 size={13} />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}