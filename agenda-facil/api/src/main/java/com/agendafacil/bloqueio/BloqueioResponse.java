package com.agendafacil.bloqueio;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record BloqueioResponse(
    Long id,
    LocalDate data,
    boolean diaInteiro,
    @JsonFormat(pattern = "HH:mm") LocalTime inicio,
    @JsonFormat(pattern = "HH:mm") LocalTime fim,
    String motivo
) {
    public static BloqueioResponse de(Bloqueio bloqueio, ZoneId zona) {
        ZonedDateTime inicio = bloqueio.getInicio().atZone(zona);
        ZonedDateTime fim = bloqueio.getFim().atZone(zona);
        boolean diaInteiro = inicio.toLocalTime().equals(LocalTime.MIDNIGHT)
            && fim.equals(inicio.plusDays(1));
        return new BloqueioResponse(bloqueio.getId(), inicio.toLocalDate(), diaInteiro,
            inicio.toLocalTime(), fim.toLocalTime(), bloqueio.getMotivo());
    }
}
