package com.nicholas.rotina.repository;

import com.nicholas.rotina.model.PlanejamentoSemanal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlanejamentoSemanalRepository extends JpaRepository<PlanejamentoSemanal, Long> {
    Optional<PlanejamentoSemanal> findByDataInicioSemana(LocalDate dataInicioSemana);
    List<PlanejamentoSemanal> findAllByDataInicioSemanaBeforeOrderByDataInicioSemanaDesc(LocalDate dataInicioSemana);
}