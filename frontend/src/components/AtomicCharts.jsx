import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, LineChart, Line, Legend,
} from 'recharts';
import { Droplet } from 'lucide-react';
import { rangeDays, fmtDateLabel } from '../utils/date';
import { WATER_GOAL, MOODS, SLEEP_QUALITY } from '../constants';

function buildSeries(historico, dias) {
  const days = rangeDays(dias);
  const map = {};
  historico.forEach((e) => { map[e.data] = e; });
  return days.map((d) => ({ date: d, label: fmtDateLabel(d), entry: map[d] || null }));}

const tooltipStyle = {
  background: '#1B1F26',
  border: '1px solid #2A2E35',
  borderRadius: 8,
  fontSize: 12,
  color: '#EDEFF2',
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
          <Droplet size={13} color="#5B9FED" style={{ verticalAlign: -2, marginRight: 5 }} />
          água por dia
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2329" vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={(value, index) => data[index]?.label.slice(0, 6) || ''}
                stroke="#5A5F68"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1F2329' }}
            />
            <YAxis stroke="#5A5F68" fontSize={10} tickLine={false} axisLine={false} width={28} />
            <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}L`, 'água']}
                labelFormatter={(value, payload) => payload?.[0]?.payload?.label || value}
            />
            <ReferenceLine y={WATER_GOAL} stroke="#E8A33D" strokeDasharray="4 4" strokeOpacity={0.6} />
            <Bar dataKey="agua" fill="#5B9FED" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}

export function HabitsConsistencyGrid({ historico, dias }) {
  const data = buildSeries(historico, dias);
  const rows = [
    { key: 'estudos', label: 'estudos', color: '#3DDC84' },
    { key: 'trabalho', label: 'trabalho', color: '#5B9FED' },
    { key: 'acordarCedo', label: 'acordar cedo', color: '#E8A33D' },
    { key: 'academia', label: 'academia', color: '#f53838'}
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
                    style={{ background: on ? row.color : '#2c2c2c' }}
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

export function MoodSleepChart({ historico, dias }) {
  const data = buildSeries(historico, dias).map((d) => {
    const sleep = SLEEP_QUALITY.find((s) => s.id === d.entry?.sono);
    const mood = MOODS.find((m) => m.id === d.entry?.humor);
    return {
      label: d.label,
      sono: sleep ? sleep.score : null,
      humorLabel: mood ? mood.label : '—',
    };
  });

  return (
    <div className="chart-block">
      <p className="chart-title">qualidade do sono (humor no detalhe ao passar o mouse)</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2329" vertical={false} />
          <XAxis dataKey="label" stroke="#5A5F68" fontSize={10} tickLine={false} axisLine={{ stroke: '#1F2329' }} />
          <YAxis domain={[0, 5]} stroke="#5A5F68" fontSize={10} tickLine={false} axisLine={false} width={28} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name, props) => {
              if (name === 'sono') return [value ? `${value}/5` : 'sem registro', 'sono'];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              const humor = payload?.[0]?.payload?.humorLabel;
              return `${label}${humor && humor !== '—' ? ` · humor: ${humor}` : ''}`;
            }}
          />
          <Line type="monotone" dataKey="sono" stroke="#5B9FED" strokeWidth={2} dot={{ r: 3, fill: '#5B9FED' }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
