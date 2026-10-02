package com.nicholas.rotina.dto;

public class RetrospectivaAguaRequest {
    private double totalLitros;
    private int diasNaMeta;

    public RetrospectivaAguaRequest(double totalLitros, int diasNaMeta) {
        this.totalLitros = totalLitros;
        this.diasNaMeta = diasNaMeta;
    }

    public double getTotalLitros() {
        return totalLitros;
    }

    public int getDiasNaMeta() {
        return diasNaMeta;
    }
}