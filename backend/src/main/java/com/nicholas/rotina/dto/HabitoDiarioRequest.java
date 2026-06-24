package com.nicholas.rotina.dto;

import com.nicholas.rotina.model.Periodo;
import jakarta.validation.constraints.NotBlank;

public class HabitoDiarioRequest {

    @NotBlank(message = "o nome do hábito é obrigatório")
    private String nome;

    private Periodo periodo;

    private String meta;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Periodo getPeriodo() {
        return periodo;
    }

    public void setPeriodo(Periodo periodo) {
        this.periodo = periodo;
    }

    public String getMeta() {
        return meta;
    }

    public void setMeta(String meta) {
        this.meta = meta;
    }
}
