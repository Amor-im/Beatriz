package com.agendafacil.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

/** Uma linha da agenda do painel. */
public record AgendamentoResponse(
    Long id,
    UUID codigo,
    String servicoNome,
    int duracaoMinutos,
    String clienteNome,
    String clienteWhatsapp,
    LocalDate data,
    @JsonFormat(pattern = "HH:mm") LocalTime inicio,
    @JsonFormat(pattern = "HH:mm") LocalTime fim,
    StatusAgendamento status
) {
    public static AgendamentoResponse de(Agendamento agendamento, ZoneId zona) {
        ZonedDateTime inicio = agendamento.getInicio().atZone(zona);
        ZonedDateTime fim = agendamento.getFim().atZone(zona);
        return new AgendamentoResponse(agendamento.getId(), agendamento.getCodigo(),
            agendamento.getServico().getNome(), agendamento.getServico().getDuracaoMinutos(),
            agendamento.getClienteNome(), agendamento.getClienteWhatsapp(),
            inicio.toLocalDate(), inicio.toLocalTime(), fim.toLocalTime(), agendamento.getStatus());
    }
}
