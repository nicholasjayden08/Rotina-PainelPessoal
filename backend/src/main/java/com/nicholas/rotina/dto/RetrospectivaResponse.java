package com.nicholas.rotina.dto;

import java.util.List;

/**
 * Retrospectiva de um ano de registros atômicos. Campos que dependem de
 * quantidade mínima de dados (dia da semana mais forte, mês mais
 * consistente, sono) vêm null quando não há dado suficiente.
 */
public record RetrospectivaResponse(
        int ano,
        int diasRegistrados,
        int maiorSequenciaRegistros,
        AguaResumo agua,
        List<HabitoResumo> habitos,
        DiaSemanaDestaque diaSemanaMaisForte,
        MesDestaque mesMaisConsistente,
        SonoResumo sono
) {
    public record AguaResumo(double totalLitros, int diasNaMeta) {}

    public record HabitoResumo(String nome, int diasFeitos, int maiorSequencia) {}

    public record DiaSemanaDestaque(String nome, double mediaHabitos) {}

    public record MesDestaque(int mes, String nome, double mediaHabitos) {}

    public record SonoResumo(
            String horarioMedioDormir,
            String horarioMedioAcordar,
            Double mediaHoras,
            NoiteLonga noiteMaisLonga
    ) {}

    public record NoiteLonga(String data, double horas) {}
}