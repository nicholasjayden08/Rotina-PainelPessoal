package com.nicholas.rotina.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "registros_atomicos", uniqueConstraints = {
        @UniqueConstraint(columnNames = "data")
})
public class RegistroAtomico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate data;

    private LocalTime acordeiAs;

    @Column(nullable = false)
    private boolean acordarCedo = false;

    @Column(nullable = false)
    private boolean estudos = false;

    @Column(nullable = false)
    private boolean trabalho = false;

    @Column(nullable = false)
    private boolean academia;

    @Column(nullable = false)
    private double agua = 0.0;

    @Enumerated(EnumType.STRING)
    private Humor humor;

    @Enumerated(EnumType.STRING)
    private QualidadeSono sono;

    public RegistroAtomico() {
    }

    public RegistroAtomico(LocalDate data) {
        this.data = data;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getAcordeiAs() {
        return acordeiAs;
    }

    public void setAcordeiAs(LocalTime acordeiAs) {
        this.acordeiAs = acordeiAs;
    }

    public boolean isAcordarCedo() {
        return acordarCedo;
    }

    public void setAcordarCedo(boolean acordarCedo) {
        this.acordarCedo = acordarCedo;
    }

    public boolean isEstudos() {
        return estudos;
    }

    public void setEstudos(boolean estudos) {
        this.estudos = estudos;
    }

    public boolean isTrabalho() {
        return trabalho;
    }

    public void setTrabalho(boolean trabalho) {
        this.trabalho = trabalho;
    }

    public boolean isAcademia() {
        return academia;
    }

    public void setAcademia(boolean academia) {
        this.academia = academia;
    }

    public double getAgua() {
        return agua;
    }

    public void setAgua(double agua) {
        this.agua = agua;
    }

    public Humor getHumor() {
        return humor;
    }

    public void setHumor(Humor humor) {
        this.humor = humor;
    }

    public QualidadeSono getSono() {
        return sono;
    }

    public void setSono(QualidadeSono sono) {
        this.sono = sono;
    }
}
