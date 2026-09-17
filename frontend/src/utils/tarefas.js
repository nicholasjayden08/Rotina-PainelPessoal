/**
 * Lógica de priorização de tarefas pra Home (alertas de tarefa urgente).
 *
 * getTarefaMaisUrgente(): entre as tarefas ATRASADAS (prazo < hoje, não
 * concluídas), acha a mais crítica — ordena por prazo mais antigo primeiro,
 * desempate por prioridade (ALTA > MEDIA > BAIXA). Retorna com diasAtraso
 * calculado.
 *
 * getTarefaProximaAVencer(): mesma lógica, mas pra tarefas que vencem nos
 * próximos 2 dias (ainda não atrasadas). Retorna com diasRestantes.
 */

import { todayISO } from './date';

const ORDEM_PRIORIDADE = { ALTA: 0, MEDIA: 1, BAIXA: 2 };

export function getTarefaMaisUrgente(tarefas) {
    const hoje = todayISO();
    const atrasadas = tarefas.filter(
        (t) => t.status !== 'CONCLUIDO' && t.prazo && t.prazo < hoje
    );
    if (atrasadas.length === 0) return null;

    const maisUrgente = [...atrasadas].sort((a, b) => {
        if (a.prazo !== b.prazo) return a.prazo < b.prazo ? -1 : 1;
        return ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade];
    })[0];

    const diasAtraso = Math.round(
        (new Date(hoje) - new Date(maisUrgente.prazo)) / 86400000
    );

    return { ...maisUrgente, diasAtraso };
}

export function getTarefaProximaAVencer(tarefas) {
    const hoje = todayISO();
    const hojeDate = new Date(hoje);
    const limiteDate = new Date(hoje);
    limiteDate.setDate(limiteDate.getDate() + 2);

    const proximas = tarefas.filter((t) => {
        if (t.status === 'CONCLUIDO' || !t.prazo) return false;
        const prazoDate = new Date(t.prazo);
        return prazoDate >= hojeDate && prazoDate <= limiteDate;
    });

    if (proximas.length === 0) return null;

    const maisUrgente = [...proximas].sort((a, b) => {
        if (a.prazo !== b.prazo) return a.prazo < b.prazo ? -1 : 1;
        return ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade];
    })[0];

    const diasRestantes = Math.round(
        (new Date(maisUrgente.prazo) - hojeDate) / 86400000
    );

    return { ...maisUrgente, diasRestantes };
}