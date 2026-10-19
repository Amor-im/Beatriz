package com.agendafacil.bloqueio;

import java.time.LocalDate;
import java.time.LocalTime;

import com.agendafacil.seguranca.Textos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Bloquear um dia inteiro ou um trecho do dia ("das 14:00 às 16:00"). */
public record BloqueioRequest(
    @NotNull(message = "Escolha o dia.")
    LocalDate data,

    boolean diaInteiro,

    LocalTime inicio,

    LocalTime fim,

    @Size(max = 80, message = "O motivo pode ter até 80 caracteres.")
    String motivo
) {
    public BloqueioRequest {
        motivo = Textos.limpar(motivo);
    }
}
