package com.nicholas.rotina.dto;

public class RetrospectivaHabitoRequest {
    private String nome;
    private int diasFeitos;
    private int maiorSequencia;

    public RetrospectivaHabitoRequest(String nome, int diasFeitos, int maiorSequencia) {
        this.nome = nome;
        this.diasFeitos = diasFeitos;
        this.maiorSequencia = maiorSequencia;
    }

    public String getNome() {
        return nome;
    }

    public int getDiasFeitos() {
        return diasFeitos;
    }

    public int getMaiorSequencia() {
        return maiorSequencia;
    }
}