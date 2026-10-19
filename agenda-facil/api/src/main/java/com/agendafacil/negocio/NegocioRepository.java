package com.agendafacil.negocio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NegocioRepository extends JpaRepository<Negocio, Long> {

    Optional<Negocio> findByDonoId(Long donoId);

    Optional<Negocio> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
