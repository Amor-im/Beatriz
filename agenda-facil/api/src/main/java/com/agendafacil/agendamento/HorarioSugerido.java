package com.agendafacil.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

/** Horário livre oferecido quando o escolhido acabou de ser ocupado. */
public record HorarioSugerido(LocalDate data, @JsonFormat(pattern = "HH:mm") LocalTime horario) {
}
