package com.agendafacil.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;
import com.fasterxml.jackson.annotation.JsonFormat;

/** O resumo que o cliente vê na confirmação. Não inclui o WhatsApp do cliente. */
public record AgendamentoPublicoResponse(
    UUID codigo,
    StatusAgendamento status,
    String negocioNome,
    String negocioSlug,
    String negocioWhatsapp,
    String negocioEndereco,
    String servicoNome,
    int duracaoMinutos,
    Integer precoCentavos,
    LocalDate data,
    @JsonFormat(pattern = "HH:mm") LocalTime inicio,
    @JsonFormat(pattern = "HH:mm") LocalTime fim,
    String clienteNome
) {
    public static AgendamentoPublicoResponse de(Agendamento agendamento, Negocio negocio, Servico servico) {
        ZonedDateTime inicio = agendamento.getInicio().atZone(negocio.zona());
        ZonedDateTime fim = agendamento.getFim().atZone(negocio.zona());
        return new AgendamentoPublicoResponse(agendamento.getCodigo(), agendamento.getStatus(),
            negocio.getNome(), negocio.getSlug(), negocio.getWhatsapp(), negocio.getEndereco(),
            servico.getNome(), servico.getDuracaoMinutos(), servico.getPrecoCentavos(),
            inicio.toLocalDate(), inicio.toLocalTime(), fim.toLocalTime(), agendamento.getClienteNome());
    }
}
