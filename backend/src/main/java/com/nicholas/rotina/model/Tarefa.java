package com.nicholas.rotina.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tarefas")
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTarefa status = StatusTarefa.NAO_INICIADO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridade prioridade = Prioridade.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Esforco esforco = Esforco.MEDIA;

    @ElementCollection(targetClass = TipoTarefa.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "tarefa_tipos", joinColumns = @JoinColumn(name = "tarefa_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo")
    private Set<TipoTarefa> tipos = new HashSet<>();

    private LocalDate prazo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    private LocalDateTime atualizadoEm = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Tarefa() {
    }

    // ---- Getters e Setters ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
