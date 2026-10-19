package com.agendafacil.horario;

import java.time.LocalTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Um dia da semana no formulário de horários. Horas no formato "09:00". */
public record DiaRequest(
    @NotNull @Min(1) @Max(7) Integer diaSemana,
    boolean aberto,
    LocalTime abre,
    LocalTime fecha,
    LocalTime almocoInicio,
    LocalTime almocoFim
) {
}
