package com.nicholas.rotina.dto;

import java.util.List;

public class MelhorSemanaRequest {

    private String inicio;
    private String fim;
    private double pontuacaoMedia;
    private List<String> motivos;

    public String getInicio() {
        return inicio;
    }

    public void setInicio(String inicio) {
        this.inicio = inicio;
    }

    public String getFim() {
        return fim;
    }

    public void setFim(String fim) {
        this.fim = fim;
    }

    public double getPontuacaoMedia() {
        return pontuacaoMedia;
    }

    public void setPontuacaoMedia(double pontuacaoMedia) {
        this.pontuacaoMedia = pontuacaoMedia;
    }

    public List<String> getMotivos() {
        return motivos;
    }

    public void setMotivos(List<String> motivos) {
        this.motivos = motivos;
    }
}