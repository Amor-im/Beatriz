package com.agendafacil.agendamento;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /** Agendamentos que ocupam algum pedaço do período (os cancelados não ocupam). */
    @Query("""
        select a from Agendamento a
        where a.negocio.id = :negocioId
          and a.status <> com.agendafacil.agendamento.StatusAgendamento.CANCELADO
          and a.inicio < :fim and a.fim > :inicio
        """)
    List<Agendamento> ativosEntre(Long negocioId, Instant inicio, Instant fim);

    /** A agenda do painel: todos os status, com o serviço já carregado (evita uma consulta por linha). */
    @Query("""
        select a from Agendamento a join fetch a.servico
        where a.negocio.id = :negocioId and a.inicio >= :de and a.inicio < :ate
        order by a.inicio
        """)
    List<Agendamento> daAgenda(Long negocioId, Instant de, Instant ate);

    /** Para a página de confirmação do cliente. */
    @Query("select a from Agendamento a join fetch a.servico join fetch a.negocio where a.codigo = :codigo")
    Optional<Agendamento> porCodigo(UUID codigo);

    Optional<Agendamento> findByIdAndNegocioId(Long id, Long negocioId);

    boolean existsByServicoId(Long servicoId);
}
