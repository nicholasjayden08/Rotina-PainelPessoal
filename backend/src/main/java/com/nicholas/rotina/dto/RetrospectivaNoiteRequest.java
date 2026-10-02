package com.nicholas.rotina.dto;

public class RetrospectivaNoiteRequest {
    private String data;
    private double horas;

    public RetrospectivaNoiteRequest(String data, double horas) {
        this.data = data;
        this.horas = horas;
    }

    public String getData() {
        return data;
    }

    public double getHoras() {
        return horas;
    }
}