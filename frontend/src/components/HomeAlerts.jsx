/**
 * Monta a lista de avisos da Home dinamicamente (água faltando, hábitos
 * do dia ainda não registrados, streak em risco) — só aparecem os que
 * se aplicam; se nenhum se aplica, o componente retorna null (sem
 * seção vazia na tela). Todo aviso, ao clicar, leva pra tela de
 * hábitos atômicos via onAbrirHabitosAtomicos.
 */

import { AlertTriangle, Droplets, Flame, Target } from 'lucide-react';
import { COLORS, WATER_GOAL } from '../constants';

const DIAS_SEM_FOCO_LIMIAR = 3;

export function HomeAlerts({
                               aguaAtual,
                               registrouHoje,
                               streakEmRisco,
                               diasSemFoco,
                               onAbrirHabitosAtomicos,
                               onAbrirFoco
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

    if (diasSemFoco !== null && diasSemFoco !== undefined && diasSemFoco >= DIAS_SEM_FOCO_LIMIAR) {
        alertas.push({
            icon: <Target size={16} color={COLORS.accent} />,
            text: `Você não faz uma sessão de foco há ${diasSemFoco} dias.`,
            action: onAbrirFoco
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