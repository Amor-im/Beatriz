package com.agendafacil.agendamento;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.bloqueio.BloqueioService;
import com.agendafacil.erro.NaoEncontradoException;
import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;

/** A agenda vista pelo dono, no painel. */
@Service
public class AgendaService {

    static final int MAX_DIAS_POR_CONSULTA = 31;

    private final AgendamentoRepository agendamentos;
    private final NegocioService negocios;
    private final BloqueioService bloqueios;
    private final Clock relogio;

    public AgendaService(AgendamentoRepository agendamentos, NegocioService negocios, BloqueioService bloqueios,
            Clock relogio) {
        this.agendamentos = agendamentos;
        this.negocios = negocios;
        this.bloqueios = bloqueios;
        this.relogio = relogio;
    }

    /** Sem datas: só o dia de hoje. */
    @Transactional(readOnly = true)
    public AgendaResponse agenda(Long donoId, LocalDate de, LocalDate ate) {
        Negocio negocio = negocios.doDono(donoId);
        LocalDate inicio = de != null ? de : hoje(negocio);
        LocalDate fim = ate != null ? ate : inicio;
        if (fim.isBefore(inicio) || fim.isAfter(inicio.plusDays(MAX_DIAS_POR_CONSULTA - 1))) {
            throw new RegraDeNegocioException("Escolha um período de até " + MAX_DIAS_POR_CONSULTA + " dias.");
        }
        return new AgendaResponse(doPeriodo(negocio, inicio, fim), bloqueios.entre(negocio, inicio, fim));
    }

    @Transactional(readOnly = true)
    public ResumoSemanaResponse resumo(Long donoId) {
        Negocio negocio = negocios.doDono(donoId);
        LocalDate hoje = hoje(negocio);
        LocalDate segunda = hoje.with(DayOfWeek.MONDAY);
        LocalDate domingo = segunda.plusDays(6);
        List<AgendamentoResponse> semana = doPeriodo(negocio, segunda, domingo);

        int confirmados = contar(semana, StatusAgendamento.CONFIRMADO);
        int aConfirmar = contar(semana, StatusAgendamento.A_CONFIRMAR);
        int cancelados = contar(semana, StatusAgendamento.CANCELADO);
        int deHoje = (int) semana.stream()
            .filter(a -> a.data().equals(hoje) && a.status() != StatusAgendamento.CANCELADO)
            .count();
        return new ResumoSemanaResponse(segunda, domingo, confirmados + aConfirmar, confirmados, aConfirmar,
            cancelados, deHoje);
    }

    @Transactional
    public AgendamentoResponse confirmar(Long donoId, Long id) {
        Negocio negocio = negocios.doDono(donoId);
        Agendamento agendamento = doNegocio(negocio, id);
        agendamento.confirmar();
        return AgendamentoResponse.de(agendamento, negocio.zona());
    }

    @Transactional
    public AgendamentoResponse cancelar(Long donoId, Long id) {
        Negocio negocio = negocios.doDono(donoId);
        Agendamento agendamento = doNegocio(negocio, id);
        agendamento.cancelar();
        return AgendamentoResponse.de(agendamento, negocio.zona());
    }

    private List<AgendamentoResponse> doPeriodo(Negocio negocio, LocalDate de, LocalDate ate) {
        ZoneId zona = negocio.zona();
        return agendamentos.daAgenda(negocio.getId(), de.atStartOfDay(zona).toInstant(),
                ate.plusDays(1).atStartOfDay(zona).toInstant())
            .stream().map(a -> AgendamentoResponse.de(a, zona)).toList();
    }

    /** Agendamento de outro negócio responde 404, igual a um que não existe. */
    private Agendamento doNegocio(Negocio negocio, Long id) {
        return agendamentos.findByIdAndNegocioId(id, negocio.getId())
            .orElseThrow(() -> new NaoEncontradoException("Agendamento não encontrado."));
    }

    private LocalDate hoje(Negocio negocio) {
        return LocalDate.now(relogio.withZone(negocio.zona()));
    }

    private static int contar(List<AgendamentoResponse> agendamentos, StatusAgendamento status) {
        return (int) agendamentos.stream().filter(a -> a.status() == status).count();
    }
}
