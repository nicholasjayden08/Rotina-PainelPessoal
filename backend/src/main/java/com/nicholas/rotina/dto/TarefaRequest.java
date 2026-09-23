package com.nicholas.rotina.dto;

import com.nicholas.rotina.model.Esforco;
import com.nicholas.rotina.model.Prioridade;
import com.nicholas.rotina.model.StatusTarefa;
import com.nicholas.rotina.model.TipoTarefa;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.Set;

public class TarefaRequest {

    @NotBlank(message = "o nome da tarefa é obrigatório")
    private String nome;

    private String descricao;

    private StatusTarefa status;

    private Prioridade prioridade;

    private Esforco esforco;

    private Set<TipoTarefa> tipos;

    private LocalDate prazo;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public void setStatus(StatusTarefa status) {
        this.status = status;
    }

    public Prioridade getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(Prioridade prioridade) {
        this.prioridade = prioridade;
    }

    public Esforco getEsforco() {
        return esforco;
    }

    public void setEsforco(Esforco esforco) {
        this.esforco = esforco;
    }

    public Set<TipoTarefa> getTipos() {
        return tipos;
    }

    public void setTipos(Set<TipoTarefa> tipos) {
        this.tipos = tipos;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }
}