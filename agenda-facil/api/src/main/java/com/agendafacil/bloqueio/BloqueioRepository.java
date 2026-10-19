package com.agendafacil.bloqueio;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BloqueioRepository extends JpaRepository<Bloqueio, Long> {

    /** Bloqueios que pegam algum pedaço do período. */
    @Query("""
        select b from Bloqueio b
        where b.negocio.id = :negocioId and b.inicio < :fim and b.fim > :inicio
        order by b.inicio
        """)
    List<Bloqueio> entre(Long negocioId, Instant inicio, Instant fim);

    Optional<Bloqueio> findByIdAndNegocioId(Long id, Long negocioId);
}
