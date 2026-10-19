package com.agendafacil.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Horários livres de um dia, já no formato que a tela mostra ("09:00"). */
public record HorariosLivresResponse(LocalDate data, List<String> horarios) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public static HorariosLivresResponse de(LocalDate data, List<LocalTime> horarios) {
        return new HorariosLivresResponse(data, horarios.stream().map(HORA::format).toList());
    }
}
