package com.nicholas.rotina.dto;

public class RetrospectivaSonoRequest {
    private String horarioMedioDormir;
    private String horarioMedioAcordar;
    private Double mediaHoras;
    private RetrospectivaNoiteRequest noiteMaisLonga;

    public RetrospectivaSonoRequest(String horarioMedioDormir, String horarioMedioAcordar,
                                    Double mediaHoras, RetrospectivaNoiteRequest noiteMaisLonga) {
        this.horarioMedioDormir = horarioMedioDormir;
        this.horarioMedioAcordar = horarioMedioAcordar;
        this.mediaHoras = mediaHoras;
        this.noiteMaisLonga = noiteMaisLonga;
    }

    public String getHorarioMedioDormir() {
        return horarioMedioDormir;
    }

    public String getHorarioMedioAcordar() {
        return horarioMedioAcordar;
    }

    public Double getMediaHoras() {
        return mediaHoras;
    }

    public RetrospectivaNoiteRequest getNoiteMaisLonga() {
        return noiteMaisLonga;
    }
}