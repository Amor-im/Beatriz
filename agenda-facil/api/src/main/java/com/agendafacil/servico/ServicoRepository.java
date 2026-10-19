package com.agendafacil.servico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByNegocioIdOrderByNomeAsc(Long negocioId);

    List<Servico> findByNegocioIdAndAtivoTrueOrderByNomeAsc(Long negocioId);

    /** Busca já filtrando pelo negócio: um dono nunca alcança o serviço de outro. */
    Optional<Servico> findByIdAndNegocioId(Long id, Long negocioId);
}
