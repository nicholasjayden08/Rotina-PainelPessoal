package com.nicholas.rotina.dto;

import com.nicholas.rotina.model.Periodo;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ReordenarHabitosRequest {

    public static class Item {
        @NotNull private Long id;
        @NotNull private Periodo periodo;
        @NotNull private Integer ordem;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Periodo getPeriodo() { return periodo; }
        public void setPeriodo(Periodo periodo) { this.periodo = periodo; }
        public Integer getOrdem() { return ordem; }
        public void setOrdem(Integer ordem) { this.ordem = ordem; }
    }

    @NotNull
    private List<Item> habitos;

    public List<Item> getHabitos() { return habitos; }
    public void setHabitos(List<Item> habitos) { this.habitos = habitos; }
}