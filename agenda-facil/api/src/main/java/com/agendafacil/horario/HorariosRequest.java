package com.agendafacil.horario;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** A semana inteira de uma vez: sempre os 7 dias, abertos ou não. */
public record HorariosRequest(
    @NotNull @Size(min = 7, max = 7, message = "Envie os 7 dias da semana.")
    List<@Valid @NotNull DiaRequest> dias
) {
}
