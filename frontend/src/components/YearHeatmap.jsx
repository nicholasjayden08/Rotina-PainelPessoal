import { useMemo } from 'react';
import { WATER_GOAL } from '../constants';
import { computeStreakInfo } from '../utils/streak';

const COLORS = ['#2c2c2c', '#143824', '#1A5A35', '#238A4A', '#2FCB6B', '#3DDC84'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function scoreFor(entry) {
    if (!entry) return 0;
    let s = 0;
    if ((entry.agua || 0) >= WATER_GOAL) s++;
    if (entry.estudos) s++;
    if (entry.trabalho) s++;
    if (entry.acordarCedo) s++;
    if (entry.academia) s++;
    return s;
}

export function YearHeatmap({ historico }) {
    const { weeks, monthPositions, totalActive, currentStreak, bestStreak } = useMemo(() => {
        const map = {};
        historico.forEach((e) => { map[e.data] = e; });

        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const dayStart = new Date(startOfYear);
        dayStart.setDate(dayStart.getDate() - dayStart.getDay());

        const weeks = [];
        let cur = new Date(dayStart);
        let lastMonth = -1;
        const monthPositions = [];
        let weekIndex = 0;

        while (cur <= today) {
            const week = [];
            for (let dow = 0; dow < 7; dow++) {
                const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
                const inYear = cur >= startOfYear && cur <= today;
                const month = cur.getMonth();
                if (dow === 0 && month !== lastMonth && inYear) {
                    monthPositions.push({ weekIndex, month });
                    lastMonth = month;
                }
                week.push({ iso, score: inYear ? scoreFor(map[iso]) : -1, title: iso });
                cur.setDate(cur.getDate() + 1);
                if (cur > today && dow < 6) {
                    for (let r = dow + 1; r < 7; r++) week.push({ iso: null, score: -1 });
                    break;
                }
            }
            weeks.push(week);
            weekIndex++;
        }

        const totalActive = Object.keys(map).filter((k) => scoreFor(map[k]) > 0).length;
        const { current: currentStreak, best: bestStreak } = computeStreakInfo(historico);

        return { weeks, monthPositions, totalActive, currentStreak, bestStreak };
    }, [historico]);

    const totalWeeks = weeks.length;

    return (
        <div>
            <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', marginBottom: 4, marginLeft: 22 }}>
                    {monthPositions.map((mp, i) => {
                        const next = i + 1 < monthPositions.length ? monthPositions[i + 1].weekIndex : totalWeeks;
                        const span = next - mp.weekIndex;
                        return (
                            <div key={mp.month} style={{ width: span * 13, fontSize: 10, color: '#5A5F68', flexShrink: 0 }}>
                                {MONTHS[mp.month]}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: 3 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 2 }}>
                        {['', 'seg', '', 'qua', '', 'sex', ''].map((l, i) => (
                            <div key={i} style={{ height: 10, lineHeight: '10px', fontSize: 9, color: '#5A5F68', width: 18 }}>{l}</div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 2 }}>
                        {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {week.map((day, di) => (
                                    <div
                                        key={di}
                                        title={day.iso && day.score >= 0 ? `${day.iso}: ${day.score}/5 hábitos` : undefined}
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 3,
                                            background: day.score === -1 ? 'transparent' : COLORS[day.score],
                                            flexShrink: 0,
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #2c2c2c' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 11, color: '#5A5F68' }}>dias ativos: <span style={{ color: '#f0efed', fontWeight: 500 }}>{totalActive}</span></span>
                    <span style={{ fontSize: 11, color: '#5A5F68' }}>sequência atual: <span style={{ color: '#f0efed', fontWeight: 500 }}>{currentStreak}</span> dias</span>
                    <span style={{ fontSize: 11, color: '#5A5F68' }}>melhor sequência: <span style={{ color: '#f0efed', fontWeight: 500 }}>{bestStreak}</span> dias</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5A5F68' }}>
                    menos
                    <div style={{ display: 'flex', gap: 2 }}>
                        {COLORS.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />)}
                    </div>
                    mais
                </div>
            </div>
        </div>
    );
}