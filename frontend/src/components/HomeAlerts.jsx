import { AlertTriangle, Droplets, Flame } from 'lucide-react';
import { COLORS, WATER_GOAL } from '../constants';

export function HomeAlerts({
                               aguaAtual,
                               registrouHoje,
                               streakEmRisco,
                               onAbrirHabitosAtomicos
                           }) {

    const faltaAgua = Math.max(0, WATER_GOAL - aguaAtual);
    const alertas = [];

    if (faltaAgua > 0) {
        alertas.push({
            icon: <Droplets size={16} color={COLORS.info} />,
            text: `Faltam ${faltaAgua.toFixed(1)}L para atingir sua meta diária.`,
            action: onAbrirHabitosAtomicos
        });
    }

    if (!registrouHoje) {
        alertas.push({
            icon: <AlertTriangle size={16} color={COLORS.warning} />,
            text: 'Você ainda não registrou seus hábitos atômicos hoje.',
            action: onAbrirHabitosAtomicos
        });
    }

    if (streakEmRisco) {
        alertas.push({
            icon: <Flame size={16} color={COLORS.danger} />,
            text: 'Seu streak está em risco. Registre seus hábitos antes do fim do dia.',
            action: onAbrirHabitosAtomicos
        });
    }

    if (alertas.length === 0) {
        return null;
    }

    return (
        <section className="panel panel-full">
            <div className="panel-header">
                <h2 className="panel-title">avisos</h2>
            </div>

            <div className="mini-list">
                {alertas.map((alerta, index) => (
                    <button
                        key={index}
                        className="mini-item"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 0,
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                        onClick={alerta.action}
                    >
                        {alerta.icon}

                        <span
                            className="mini-item-text"
                            style={{ marginLeft: 10 }}
                        >
                            {alerta.text}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}