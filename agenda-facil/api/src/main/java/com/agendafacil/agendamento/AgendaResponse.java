package com.agendafacil.agendamento;

import java.util.List;

import com.agendafacil.bloqueio.BloqueioResponse;

/** Agenda do painel num período: os agendamentos e os bloqueios, numa chamada só. */
public record AgendaResponse(List<AgendamentoResponse> agendamentos, List<BloqueioResponse> bloqueios) {
}
