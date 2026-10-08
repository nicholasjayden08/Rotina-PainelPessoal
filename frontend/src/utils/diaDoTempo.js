/**
 * Lógica da "Máquina do tempo": junta tudo que foi registrado num dia
 * (registro atômico, tarefas e notas) e escreve a história daquele dia.
 *
 * montarDia() devolve os dados brutos do dia + `historia`, uma lista de
 * frases geradas por regras (sem IA). As frases são observacionais:
 * "você dormiu", nunca "por causa de". Tarefas concluídas são
 * aproximadas pela data da última atualização (a Tarefa não guarda a
 * data de conclusão), então editar uma tarefa depois de concluída muda
 * o dia em que ela aparece.
 *
 * memoriaDeHoje() procura um registro de 1 ano, 6 meses, 3 meses, 1 mês
 * ou 1 semana atrás (o mais antigo que existir) pro card "neste dia".
 * primeiraData() dá o limite pra navegar pro passado.
 * Sequências ("5º dia seguido de academia") contam dias corridos: um
 * dia sem registro quebra a sequência.
 */

import { addDays, todayISO } from './date';
import { MOODS, SLEEP_QUALITY, WATER_GOAL, findLabel } from '../constants';

const HABITOS_DIA = [
    { campo: 'estudos', nome: 'estudos' },
    { campo: 'trabalho', nome: 'trabalho' },
    { campo: 'acordarCedo', nome: 'acordar cedo' },
    { campo: 'academia', nome: 'academia' },
];

const MIN_SEQUENCIA_FRASE = 2;

const MARCOS_MEMORIA = [
    { dias: 365, rotulo: 'há 1 ano' },
    { dias: 180, rotulo: 'há 6 meses' },
    { dias: 90, rotulo: 'há 3 meses' },
    { dias: 30, rotulo: 'há 1 mês' },
    { dias: 7, rotulo: 'há 1 semana' },
];

export function fmtMinutos(total) {
    return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`;
}

function fmtNum(n) {
    return n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function juntar(itens) {
    if (itens.length <= 1) return itens.join('');
    return itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1];
}

function plural(n, singular, pluralTxt) {
    return n === 1 ? `${n} ${singular}` : `${n} ${pluralTxt}`;
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function soData(dataHora) {
    return (dataHora || '').slice(0, 10);
}

function minutosDeSono(dormiAs, acordeiAs) {
    if (!dormiAs || !acordeiAs) return null;

    const [horaDormir, minutoDormir] = dormiAs.split(':').map(Number);
    const [horaAcordar, minutoAcordar] = acordeiAs.split(':').map(Number);

    const inicio = horaDormir * 60 + minutoDormir;
    let fim = horaAcordar * 60 + minutoAcordar;

    // dormiu antes da meia-noite e acordou no dia seguinte
    if (fim < inicio) fim += 24 * 60;

    const total = fim - inicio;
    return total > 0 ? total : null;
}

function indexarPorData(registros) {
    const mapa = {};
    registros.forEach((r) => { mapa[r.data] = r; });
    return mapa;
}

function sequenciaNoDia(mapa, iso, qualifica) {
    let n = 0;
    let dia = iso;
    while (mapa[dia] && qualifica(mapa[dia])) {
        n++;
        dia = addDays(dia, -1);
    }
    return n;
}

function temConteudo(r) {
    return (r.agua || 0) > 0
        || !!r.humor
        || !!r.sono
        || !!r.dormiAs
        || !!r.acordeiAs
        || HABITOS_DIA.some((h) => r[h.campo]);
}

function montarHistoria(d) {
    const frases = [];

    const acoes = [];
    if (d.minutosSono) {
        let texto = `dormiu ${fmtMinutos(d.minutosSono)} (${d.registro.dormiAs.slice(0, 5)} → ${d.registro.acordeiAs.slice(0, 5)})`;
        if (d.qualidadeSono) texto += `, com sono ${d.qualidadeSono}`;
        acoes.push(texto);
    } else if (d.qualidadeSono) {
        acoes.push(`teve um sono ${d.qualidadeSono}`);
    }
    if (d.agua > 0) {
        acoes.push(`bebeu ${fmtNum(d.agua)}L de água${d.agua >= WATER_GOAL ? ' (meta batida)' : ''}`);
    }
    if (acoes.length > 0) frases.push(`Você ${juntar(acoes)}.`);

    if (d.humor) frases.push(`Seu humor foi ${d.humor}.`);

    if (d.habitosFeitos.length > 0) {
        frases.push(`Marcou ${juntar(d.habitosFeitos.map((h) => h.nome))}.`);
    }

    const trabalho = [];
    if (d.concluidas.length > 0) trabalho.push(`concluiu ${plural(d.concluidas.length, 'tarefa', 'tarefas')}`);
    if (d.criadas.length > 0) trabalho.push(`criou ${plural(d.criadas.length, 'tarefa nova', 'tarefas novas')}`);
    if (d.notasCriadas.length === 1) trabalho.push(`escreveu a nota “${d.notasCriadas[0].titulo}”`);
    else if (d.notasCriadas.length > 1) trabalho.push(`escreveu ${d.notasCriadas.length} notas`);
    if (d.notasEditadas.length === 1) trabalho.push(`editou a nota “${d.notasEditadas[0].titulo}”`);
    else if (d.notasEditadas.length > 1) trabalho.push(`editou ${d.notasEditadas.length} notas`);
    if (trabalho.length > 0) frases.push(`${capitalizar(juntar(trabalho))}.`);

    if (d.sequencias.length > 0) {
        const [primeira, segunda] = d.sequencias;
        let texto = `Foi o ${primeira.dias}º dia seguido de ${primeira.nome}`;
        if (segunda) texto += ` e o ${segunda.dias}º de ${segunda.nome}`;
        frases.push(`${texto}.`);
    }

    return frases;
}

export function montarDia(iso, { registros, tarefas, notas }) {
    const mapa = indexarPorData(registros);
    const registro = mapa[iso] || null;

    const concluidas = tarefas.filter((t) => t.status === 'CONCLUIDO' && soData(t.atualizadoEm) === iso);
    const criadas = tarefas.filter((t) => soData(t.criadoEm) === iso);
    const notasCriadas = notas.filter((n) => soData(n.dataCriacao) === iso);
    const notasEditadas = notas.filter(
        (n) => soData(n.dataAtualizacao) === iso && soData(n.dataCriacao) !== iso
    );

    const habitosFeitos = registro ? HABITOS_DIA.filter((h) => registro[h.campo]) : [];
    const sequencias = habitosFeitos
        .map((h) => ({ nome: h.nome, dias: sequenciaNoDia(mapa, iso, (r) => !!r[h.campo]) }))
        .filter((s) => s.dias >= MIN_SEQUENCIA_FRASE)
        .sort((a, b) => b.dias - a.dias)
        .slice(0, 2);

    const dia = {
        iso,
        registro,
        minutosSono: registro ? minutosDeSono(registro.dormiAs, registro.acordeiAs) : null,
        qualidadeSono: registro?.sono ? findLabel(SLEEP_QUALITY, registro.sono).toLowerCase() : null,
        humorId: registro?.humor || null,
        humor: registro?.humor ? findLabel(MOODS, registro.humor).toLowerCase() : null,
        agua: registro?.agua || 0,
        habitosFeitos,
        sequencias,
        concluidas,
        criadas,
        notasCriadas,
        notasEditadas,
    };

    dia.historia = montarHistoria(dia);
    dia.vazio = dia.historia.length === 0;
    return dia;
}

export function memoriaDeHoje(registros) {
    const mapa = indexarPorData(registros);
    const hoje = todayISO();

    for (const marco of MARCOS_MEMORIA) {
        const iso = addDays(hoje, -marco.dias);
        const registro = mapa[iso];
        if (!registro || !temConteudo(registro)) continue;

        const partes = [];
        const minutos = minutosDeSono(registro.dormiAs, registro.acordeiAs);
        if (minutos) partes.push(`dormiu ${fmtMinutos(minutos)}`);

        const feitos = HABITOS_DIA.filter((h) => registro[h.campo]).map((h) => h.nome);
        if (feitos.length > 0) partes.push(`marcou ${juntar(feitos)}`);

        if (registro.humor) partes.push(`humor ${findLabel(MOODS, registro.humor).toLowerCase()}`);
        if ((registro.agua || 0) > 0) partes.push(`${fmtNum(registro.agua)}L de água`);

        return { iso, rotulo: marco.rotulo, resumo: partes.join(' · ') };
    }

    return null;
}

// Data mais antiga com algum dado (registro, tarefa ou nota); limite pro "dia anterior".
export function primeiraData({ registros, tarefas, notas }) {
    const datas = [
        ...registros.map((r) => r.data),
        ...tarefas.map((t) => soData(t.criadoEm)),
        ...notas.map((n) => soData(n.dataCriacao)),
    ].filter(Boolean);

    return datas.length > 0 ? datas.reduce((a, b) => (a < b ? a : b)) : null;
}