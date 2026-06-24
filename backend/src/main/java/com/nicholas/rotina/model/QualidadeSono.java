package com.nicholas.rotina.model;

public enum QualidadeSono {
    PERFEITO(5), MUITO_BOM(4), BOM(3), MAIS_OU_MENOS(2), RUIM(1);

    private final int score;

    QualidadeSono(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }
}
