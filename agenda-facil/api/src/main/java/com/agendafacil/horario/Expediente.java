package com.agendafacil.horario;

import java.time.LocalTime;

/** O horário de atendimento de um dia: abre, fecha e, se tiver, a pausa do almoço. */
public record Expediente(LocalTime abre, LocalTime fecha, LocalTime almocoInicio, LocalTime almocoFim) {

    public boolean temAlmoco() {
        return almocoInicio != null && almocoFim != null;
    }
}
