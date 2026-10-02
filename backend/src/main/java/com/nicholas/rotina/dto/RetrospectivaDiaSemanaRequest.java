package com.nicholas.rotina.dto;

public class RetrospectivaDiaSemanaRequest {
    private String nome;
    private double mediaHabitos;

    public RetrospectivaDiaSemanaRequest(String nome, double mediaHabitos) {
        this.nome = nome;
        this.mediaHabitos = mediaHabitos;
    }

    public String getNome() {
        return nome;
    }

    public double getMediaHabitos() {
        return mediaHabitos;
    }
}