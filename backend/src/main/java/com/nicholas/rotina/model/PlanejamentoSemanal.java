package com.nicholas.rotina.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "planejamentos_semanais")
public class PlanejamentoSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate dataInicioSemana;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPlanejamento status = StatusPlanejamento.RASCUNHO;

    @Column(columnDefinition = "TEXT")
    private String textoBruto;

    @OneToMany(mappedBy = "planejamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<ItemMetaSemanal> itens = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dataCriacao;

    @Column(nullable = false)
    private LocalDateTime dataAtualizacao;

    private LocalDateTime dataFechamento;

    @PrePersist
    public void prePersist() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDataInicioSemana() {
        return dataInicioSemana;
    }

    public void setDataInicioSemana(LocalDate dataInicioSemana) {
        this.dataInicioSemana = dataInicioSemana;
    }

    public StatusPlanejamento getStatus() {
        return status;
    }

    public void setStatus(StatusPlanejamento status) {
        this.status = status;
    }

    public String getTextoBruto() {
        return textoBruto;
    }

    public void setTextoBruto(String textoBruto) {
        this.textoBruto = textoBruto;
    }

    public List<ItemMetaSemanal> getItens() {
        return itens;
    }

    public void setItens(List<ItemMetaSemanal> itens) {
        this.itens = itens;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public LocalDateTime getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(LocalDateTime dataFechamento) {
        this.dataFechamento = dataFechamento;
    }
}