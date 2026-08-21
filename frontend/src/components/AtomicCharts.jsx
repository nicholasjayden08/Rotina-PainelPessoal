import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, LineChart, Line, Legend,
} from 'recharts';
import { Droplet } from 'lucide-react';
import { rangeDays, fmtDateLabel } from '../utils/date';
import { WATER_GOAL, MOODS, SLEEP_QUALITY, COLORS } from '../constants';

function buildSeries(historico, dias) {
  const days = rangeDays(dias);
  const map = {};
  historico.forEach((e) => { map[e.data] = e; });
  return days.map((d) => ({ date: d, label: fmtDateLabel(d), entry: map[d] || null }));}

const tooltipStyle = {
  background: COLORS.tooltipBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 11,
  color: COLORS.textPrimary,
};

export function WaterChart({ historico, dias }) {
  const data = buildSeries(historico, dias).map((d) => ({
    date: d.date,
    label: d.label,
    agua: d.entry?.agua || 0,
  }));

  return (
      <div className="chart-block">
        <p className="chart-title">
          <Droplet size={13} color={COLORS.info} style={{ verticalAlign: -2, marginRight: 5 }} />
          água por dia
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={(value, index) => data[index]?.label.slice(0, 6) || ''}
                stroke={COLORS.textMuted}
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: COLORS.gridLine }}
            />
            <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} width={28} />
            <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}L`, 'água']}
                labelFormatter={(value, payload) => payload?.[0]?.payload?.label || value}
            />
            <ReferenceLine y={WATER_GOAL} stroke={COLORS.warning} strokeDasharray="4 4" strokeOpacity={0.6} />
            <Bar dataKey="agua" fill={COLORS.info} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}

export function HabitsConsistencyGrid({ historico, dias }) {
  const data = buildSeries(historico, dias);
  const rows = [
    { key: 'estudos', label: 'estudos', color: COLORS.success },
    { key: 'trabalho', label: 'trabalho', color: COLORS.info },
    { key: 'acordarCedo', label: 'acordar cedo', color: COLORS.warning },
    { key: 'academia', label: 'academia', color: COLORS.danger }
  ];

  return (
      <div className="chart-block">
        <p className="chart-title">consistência de hábitos</p>
        <div className="grid-chart">
          {rows.map((row) => (
              <div key={row.key} className="grid-chart-row">
                <span className="grid-chart-label">{row.label}</span>
                <div className="grid-chart-cells">
                  {data.map((d) => {
                    const on = !!d.entry?.[row.key];
                    return (
                        <div
                            key={d.date}
                            title={`${d.date}: ${on ? 'feito' : 'não feito'}`}
                            className="grid-chart-cell"
                            style={{ background: on ? row.color : COLORS.cellInactive }}
                        />
                    );
                  })}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}
function calcularHorasSono(dormiAs, acordeiAs) {
  if (!dormiAs || !acordeiAs) return '—';

  const [horaDormir, minutoDormir] = dormiAs.split(':').map(Number);
  const [horaAcordar, minutoAcordar] = acordeiAs.split(':').map(Number);

  let inicio = horaDormir * 60 + minutoDormir;
  let fim = horaAcordar * 60 + minutoAcordar;

  // caso tenha dormido antes da meia-noite e acordado no dia seguinte
  if (fim < inicio) {
    fim += 24 * 60;
  }

  const totalMinutos = fim - inicio;

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas}h ${minutos}min`;
}

function SleepTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
      <div style={{ ...tooltipStyle, padding: 10 }}>
        <div style={{ marginBottom: 6 }}>
          {label}
          {item.humorLabel !== '—' && ` · ${item.humorLabel}`}
        </div>

        {item.horasSono !== '—' && (
            <div>
              Dormiu: {item.horasSono}
            </div>
        )}

        <div>
          Qualidade: {item.sono ? `${item.sono}/5` : '—'}
        </div>
      </div>
  );
}

export function MoodSleepChart({ historico, dias }) {
  const data = buildSeries(historico, dias).map((d) => {
    const sleep = SLEEP_QUALITY.find((s) => s.id === d.entry?.sono);
    const mood = MOODS.find((m) => m.id === d.entry?.humor);

    return {
      label: d.label,
      sono: sleep ? sleep.score : null,
      humorLabel: mood ? mood.label : '—',
      horasSono: calcularHorasSono(
          d.entry?.dormiAs,
          d.entry?.acordeiAs
      ),
    };
  });

  return (
      <div className="chart-block">
        <p className="chart-title">
          qualidade do sono (humor no detalhe ao passar o mouse)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
              data={data}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.gridLine}
                vertical={false}
            />
            <XAxis
                dataKey="label"
                stroke={COLORS.textMuted}
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: COLORS.gridLine }}
            />
            <YAxis
                domain={[0, 5]}
                stroke={COLORS.textMuted}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={28}
            />
            <Tooltip content={<SleepTooltip />} />

            <Line
                type="monotone"
                dataKey="sono"
                stroke={COLORS.info}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.info }}
                connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}