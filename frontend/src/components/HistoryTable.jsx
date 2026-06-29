import { Trash2, CheckSquare } from 'lucide-react';
import { EmptyHint } from './Shared';
import { fmtDatePT, fmtTimePT } from '../utils/date';
import { MOODS, SLEEP_QUALITY, findLabel } from '../constants';

export function HistoryTable({ historico, onDelete }) {
  if (historico.length === 0) return <EmptyHint text="nenhum registro ainda." />;

  return (
    <div className="history-table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th className="th">data</th>
            <th className="th">acordei às</th>
            <th className="th">água</th>
            <th className="th">humor</th>
            <th className="th">sono</th>
            <th className="th">cedo</th>
            <th className="th">estudos</th>
            <th className="th">trabalho</th>
            <th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {historico.map((e) => (
            <tr key={e.id}>
              <td className="td">{fmtDatePT(e.data)}</td>
              <td className="td">{fmtTimePT(e.acordeiAs) || '—'}</td>
              <td className="td">{(e.agua || 0)}L</td>
              <td className="td">{findLabel(MOODS, e.humor) || '—'}</td>
              <td className="td">{findLabel(SLEEP_QUALITY, e.sono) || '—'}</td>
              <td className="td">{e.acordarCedo ? <CheckSquare size={14} color="#3DDC84" /> : '—'}</td>
              <td className="td">{e.estudos ? <CheckSquare size={14} color="#3DDC84" /> : '—'}</td>
              <td className="td">{e.trabalho ? <CheckSquare size={14} color="#3DDC84" /> : '—'}</td>
              <td className="td">
                <button className="icon-btn" onClick={() => onDelete(e.id)} aria-label="excluir registro">
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
