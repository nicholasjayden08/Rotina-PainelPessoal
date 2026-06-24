package com.nicholas.rotina.repository;

import com.nicholas.rotina.model.RegistroAtomico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroAtomicoRepository extends JpaRepository<RegistroAtomico, Long> {

    Optional<RegistroAtomico> findByData(LocalDate data);

    List<RegistroAtomico> findByDataBetweenOrderByDataAsc(LocalDate inicio, LocalDate fim);
}
