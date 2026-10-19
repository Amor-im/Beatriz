package com.agendafacil.horario;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record DiaResponse(
    int diaSemana,
    boolean aberto,
    @JsonFormat(pattern = "HH:mm") LocalTime abre,
    @JsonFormat(pattern = "HH:mm") LocalTime fecha,
    @JsonFormat(pattern = "HH:mm") LocalTime almocoInicio,
    @JsonFormat(pattern = "HH:mm") LocalTime almocoFim
) {
    public static DiaResponse fechado(int diaSemana) {
        return new DiaResponse(diaSemana, false, null, null, null, null);
    }
}
