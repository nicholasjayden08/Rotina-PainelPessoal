package com.nicholas.rotina.dto;

import java.util.List;

public class InsightResponseRequest {

    private boolean dadosSuficientes;
    private List<InsightItemRequest> insights;

    public boolean isDadosSuficientes() {
        return dadosSuficientes;
    }

    public void setDadosSuficientes(boolean dadosSuficientes) {
        this.dadosSuficientes = dadosSuficientes;
    }

    public List<InsightItemRequest> getInsights() {
        return insights;
    }

    public void setInsights(List<InsightItemRequest> insights) {
        this.insights = insights;
    }
}