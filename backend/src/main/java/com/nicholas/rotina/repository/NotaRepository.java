package com.nicholas.rotina.repository;

import com.nicholas.rotina.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotaRepository extends JpaRepository<Nota, Long> {
    List<Nota> findAllByOrderByFixadoDescDataAtualizacaoDesc();
}