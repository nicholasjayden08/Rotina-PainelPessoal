package com.nicholas.rotina.model;

public enum StatusTarefa {
    NAO_INICIADO("Não iniciado"),
    EM_ANDAMENTO("Em andamento"),
    CONCLUIDO("Concluído");

    private final String label;

    StatusTarefa(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
