package com.nicholas.rotina.dto;

import java.util.List;

public class RetrospectivaRequest {
    private int ano;
    private int diasRegistrados;
    private int maiorSequenciaRegistros;
    private RetrospectivaAguaRequest agua;
    private List<RetrospectivaHabitoRequest> habitos;
    private RetrospectivaDiaSemanaRequest diaSemanaMaisForte;
    private RetrospectivaMesRequest mesMaisConsistente;
    private RetrospectivaSonoRequest sono;

    public RetrospectivaRequest(int ano, int diasRegistrados, int maiorSequenciaRegistros,
                                RetrospectivaAguaRequest agua, List<RetrospectivaHabitoRequest> habitos,
                                RetrospectivaDiaSemanaRequest diaSemanaMaisForte,
                                RetrospectivaMesRequest mesMaisConsistente, RetrospectivaSonoRequest sono) {
        this.ano = ano;
        this.diasRegistrados = diasRegistrados;
        this.maiorSequenciaRegistros = maiorSequenciaRegistros;
        this.agua = agua;
        this.habitos = habitos;
        this.diaSemanaMaisForte = diaSemanaMaisForte;
        this.mesMaisConsistente = mesMaisConsistente;
        this.sono = sono;
    }

    public int getAno() {
        return ano;
    }

    public int getDiasRegistrados() {
        return diasRegistrados;
    }

    public int getMaiorSequenciaRegistros() {
        return maiorSequenciaRegistros;
    }

    public RetrospectivaAguaRequest getAgua() {
        return agua;
    }

    public List<RetrospectivaHabitoRequest> getHabitos() {
        return habitos;
    }

    public RetrospectivaDiaSemanaRequest getDiaSemanaMaisForte() {
        return diaSemanaMaisForte;
    }

    public RetrospectivaMesRequest getMesMaisConsistente() {
        return mesMaisConsistente;
    }

    public RetrospectivaSonoRequest getSono() {
        return sono;
    }
}