package com.nicholas.rotina.repository;

import com.nicholas.rotina.model.Foco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FocoRepository extends JpaRepository<Foco, Long> {
    List<Foco> findAllByOrderByConcluidaEmDesc();
}