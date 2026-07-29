package com.nicholas.rotina.dto;

public class EstatisticasRequest {

    private int diasRegistrados;
    private int totalDiasMes;

    private double mediaAgua;

    private int diasEstudo;
    private int diasTrabalho;
    private int diasAcademia;
    private int diasAcordouCedo;

    private double percentualEstudo;
    private double percentualTrabalho;
    private double percentualAcademia;
    private double percentualAcordouCedo;

    private String humorPredominante;

    private String mediaSono;
    private String mediaDormiAs;
    private String mediaAcordeiAs;

    public int getDiasRegistrados() {
        return diasRegistrados;
    }

    public void setDiasRegistrados(int diasRegistrados) {
        this.diasRegistrados = diasRegistrados;
    }

    public int getTotalDiasMes() {
        return totalDiasMes;
    }

    public void setTotalDiasMes(int totalDiasMes) {
        this.totalDiasMes = totalDiasMes;
    }

    public double getMediaAgua() {
        return mediaAgua;
    }

    public void setMediaAgua(double mediaAgua) {
        this.mediaAgua = mediaAgua;
    }

    public int getDiasEstudo() {
        return diasEstudo;
    }

    public void setDiasEstudo(int diasEstudo) {
        this.diasEstudo = diasEstudo;
    }

    public int getDiasTrabalho() {
        return diasTrabalho;
    }

    public void setDiasTrabalho(int diasTrabalho) {
        this.diasTrabalho = diasTrabalho;
    }

    public int getDiasAcademia() {
        return diasAcademia;
    }

    public void setDiasAcademia(int diasAcademia) {
        this.diasAcademia = diasAcademia;
    }

    public int getDiasAcordouCedo() {
        return diasAcordouCedo;
    }

    public void setDiasAcordouCedo(int diasAcordouCedo) {
        this.diasAcordouCedo = diasAcordouCedo;
    }

    public double getPercentualEstudo() {
        return percentualEstudo;
    }

    public void setPercentualEstudo(double percentualEstudo) {
        this.percentualEstudo = percentualEstudo;
    }

    public double getPercentualTrabalho() {
        return percentualTrabalho;
    }

    public void setPercentualTrabalho(double percentualTrabalho) {
        this.percentualTrabalho = percentualTrabalho;
    }

    public double getPercentualAcademia() {
        return percentualAcademia;
    }

    public void setPercentualAcademia(double percentualAcademia) {
        this.percentualAcademia = percentualAcademia;
    }

    public double getPercentualAcordouCedo() {
        return percentualAcordouCedo;
    }

    public void setPercentualAcordouCedo(double percentualAcordouCedo) {
        this.percentualAcordouCedo = percentualAcordouCedo;
    }

    public String getHumorPredominante() {
        return humorPredominante;
    }

    public void setHumorPredominante(String humorPredominante) {
        this.humorPredominante = humorPredominante;
    }

    public String getMediaSono() {
        return mediaSono;
    }

    public void setMediaSono(String mediaSono) {
        this.mediaSono = mediaSono;
    }

    public String getMediaDormiAs() { return mediaDormiAs; }

    public void setMediaDormiAs(String mediaDormiAs) { this.mediaDormiAs = mediaDormiAs; }

    public String getMediaAcordeiAs() { return mediaAcordeiAs; }

    public void setMediaAcordeiAs(String mediaAcordeiAs) { this.mediaAcordeiAs = mediaAcordeiAs; }
}
