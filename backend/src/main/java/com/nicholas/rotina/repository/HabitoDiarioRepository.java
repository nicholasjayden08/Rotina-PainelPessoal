package com.nicholas.rotina.repository;

import com.nicholas.rotina.model.HabitoDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitoDiarioRepository extends JpaRepository<HabitoDiario, Long> {
}
