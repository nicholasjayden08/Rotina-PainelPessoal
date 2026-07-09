package com.nicholas.rotina.dto;

public class EstatisticaMesRequest {
    private Integer ano;
    private Integer mes;
    private String label;

    public EstatisticaMesRequest(Integer ano, Integer mes, String label) {
        this.ano = ano;
        this.mes = mes;
        this.label = label;
    }

    public Integer getAno() {
        return ano;
    }

    public Integer getMes() {
        return mes;
    }

    public String getLabel() {
        return label;
    }
}
