/**
 * Tabela do histórico completo de registros atômicos, com filtro por
 * hábito (FILTROS_HABITO). Com "todos" selecionado mostra a tabela
 * completa (uma coluna por hábito); com um hábito específico, mostra só
 * data + valor daquele campo via formatarValor(). BOOLEAN_FIELDS decide
 * se o valor vira ✓/— ou é formatado de outro jeito (litros, horário etc).
 */

import { useState } from 'react';
import { Trash2, CheckSquare } from 'lucide-react';
import { EmptyHint } from './Shared';
import { CustomSelect } from './CustomSelect';
import { fmtDatePT, fmtTimePT } from '../utils/date';
import { MOODS, SLEEP_QUALITY, findLabel, COLORS } from '../constants';

const FILTROS_HABITO = [
  { id: 'todos', label: 'todos os hábitos' },
  { id: 'agua', label: 'água' },
  { id: 'sono', label: 'qualidade do sono' },
  { id: 'humor', label: 'humor' },
  { id: 'dormiAs', label: 'dormiu às' },
  { id: 'acordeiAs', label: 'acordou às' },
  { id: 'acordarCedo', label: 'acordou cedo' },
  { id: 'estudos', label: 'estudou' },
  { id: 'trabalho', label: 'trabalhou' },
  { id: 'academia', label: 'academia' },
];

const BOOLEAN_FIELDS = new Set(['acordarCedo', 'estudos', 'trabalho', 'academia']);

function formatarValor(e, campo) {
  if (BOOLEAN_FIELDS.has(campo)) {
    return e[campo] ? <CheckSquare size={14} color={COLORS.success} /> : '—';
  }
  switch (campo) {
    case 'agua': return `${e.agua || 0}L`;
    case 'sono': return findLabel(SLEEP_QUALITY, e.sono) || '—';
    case 'humor': return findLabel(MOODS, e.humor) || '—';
    case 'dormiAs': return fmtTimePT(e.dormiAs) || '—';
    case 'acordeiAs': return fmtTimePT(e.acordeiAs) || '—';
    default: return '—';
  }
}

export function HistoryTable({ historico, onDelete }) {
  const [filtro, setFiltro] = useState('todos');
  const filtroInfo = FILTROS_HABITO.find((f) => f.id === filtro);

  return (
      <>
        <div className="panel-header">
          <h2 className="panel-title">histórico completo</h2>
          <CustomSelect
              value={filtro}
              onChange={setFiltro}
              options={FILTROS_HABITO.map((f) => ({ value: f.id, label: f.label }))}
              style={{ maxWidth: 200 }}
          />
        </div>

        {historico.length === 0 ? (
            <EmptyHint text="nenhum registro ainda." />
        ) : filtro === 'todos' ? (
            <div className="history-table-wrap">
              <table className="table">
                <thead>
                <tr>
                  <th className="th">data</th>
                  <th className="th">dormi às</th>
                  <th className="th">acordei às</th>
                  <th className="th">água</th>
                  <th className="th">humor</th>
                  <th className="th">sono</th>
                  <th className="th">cedo</th>
                  <th className="th">estudos</th>
                  <th className="th">trabalho</th>
                  <th className="th">academia</th>
                  <th className="th"></th>
                </tr>
                </thead>
                <tbody>
                {historico.map((e) => (
                    <tr key={e.id}>
                      <td className="td">{fmtDatePT(e.data)}</td>
                      <td className="td">{fmtTimePT(e.dormiAs) || '—'}</td>
                      <td className="td">{fmtTimePT(e.acordeiAs) || '—'}</td>
                      <td className="td">{(e.agua || 0)}L</td>
                      <td className="td">{findLabel(MOODS, e.humor) || '—'}</td>
                      <td className="td">{findLabel(SLEEP_QUALITY, e.sono) || '—'}</td>
                      <td className="td">{e.acordarCedo ? <CheckSquare size={14} color={COLORS.success} /> : '—'}</td>
                      <td className="td">{e.estudos ? <CheckSquare size={14} color={COLORS.success} /> : '—'}</td>
                      <td className="td">{e.trabalho ? <CheckSquare size={14} color={COLORS.success} /> : '—'}</td>
                      <td className="td">{e.academia ? <CheckSquare size={14} color={COLORS.success} /> : '—'}</td>
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
        ) : (
            <div className="history-table-wrap">
              <table className="table">
                <thead>
                <tr>
                  <th className="th">data</th>
                  <th className="th">{filtroInfo.label}</th>
                  <th className="th"></th>
                </tr>
                </thead>
                <tbody>
                {historico.map((e) => (
                    <tr key={e.id}>
                      <td className="td">{fmtDatePT(e.data)}</td>
                      <td className="td">{formatarValor(e, filtro)}</td>
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
        )}
      </>
  );
}