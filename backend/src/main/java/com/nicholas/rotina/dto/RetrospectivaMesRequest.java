package com.nicholas.rotina.dto;

public class RetrospectivaMesRequest {
    private int mes;
    private String nome;
    private double mediaHabitos;

    public RetrospectivaMesRequest(int mes, String nome, double mediaHabitos) {
        this.mes = mes;
        this.nome = nome;
        this.mediaHabitos = mediaHabitos;
    }

    public int getMes() {
        return mes;
    }

    public String getNome() {
        return nome;
    }

    public double getMediaHabitos() {
        return mediaHabitos;
    }
}