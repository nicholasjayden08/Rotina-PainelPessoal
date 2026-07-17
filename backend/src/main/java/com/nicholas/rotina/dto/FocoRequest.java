package com.nicholas.rotina.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FocoRequest {

    private String titulo;

    @NotNull
    @Min(1)
    private Integer duracaoMinutos;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Integer getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public void setDuracaoMinutos(Integer duracaoMinutos) {
        this.duracaoMinutos = duracaoMinutos;
    }
}