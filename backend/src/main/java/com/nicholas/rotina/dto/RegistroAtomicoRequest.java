package com.nicholas.rotina.dto;

import com.nicholas.rotina.model.Humor;
import com.nicholas.rotina.model.QualidadeSono;

import java.time.LocalTime;

public class RegistroAtomicoRequest {

    private LocalTime acordeiAs;
    private Boolean acordarCedo;
    private Boolean estudos;
    private Boolean trabalho;
    private Double agua;
    private Humor humor;
    private QualidadeSono sono;

    public LocalTime getAcordeiAs() {
        return acordeiAs;
    }

    public void setAcordeiAs(LocalTime acordeiAs) {
        this.acordeiAs = acordeiAs;
    }

    public Boolean getAcordarCedo() {
        return acordarCedo;
    }

    public void setAcordarCedo(Boolean acordarCedo) {
        this.acordarCedo = acordarCedo;
    }

    public Boolean getEstudos() {
        return estudos;
    }

    public void setEstudos(Boolean estudos) {
        this.estudos = estudos;
    }

    public Boolean getTrabalho() {
        return trabalho;
    }

    public void setTrabalho(Boolean trabalho) {
        this.trabalho = trabalho;
    }

    public Double getAgua() {
        return agua;
    }

    public void setAgua(Double agua) {
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
