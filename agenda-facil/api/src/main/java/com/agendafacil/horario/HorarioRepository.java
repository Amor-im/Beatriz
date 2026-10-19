package com.agendafacil.horario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HorarioRepository extends JpaRepository<HorarioFuncionamento, Long> {

    List<HorarioFuncionamento> findByNegocioIdOrderByDiaSemanaAsc(Long negocioId);
}
