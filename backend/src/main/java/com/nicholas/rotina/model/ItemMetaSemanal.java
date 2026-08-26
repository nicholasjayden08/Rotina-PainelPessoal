package com.nicholas.rotina.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "itens_meta_semanal")
public class ItemMetaSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "planejamento_id", nullable = false)
    @JsonIgnore
    private PlanejamentoSemanal planejamento;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean concluida = false;

    @Column(nullable = false)
    private int ordem;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlanejamentoSemanal getPlanejamento() {
        return planejamento;
    }

    public void setPlanejamento(PlanejamentoSemanal planejamento) {
        this.planejamento = planejamento;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }

    public int getOrdem() {
        return ordem;
    }

    public void setOrdem(int ordem) {
        this.ordem = ordem;
    }
}