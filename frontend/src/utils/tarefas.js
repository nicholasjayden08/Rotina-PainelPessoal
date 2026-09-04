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