package com.agendafacil.agendamento;

import java.time.LocalDate;

/** Contador da semana atual (segunda a domingo) para o topo do painel. */
public record ResumoSemanaResponse(
    LocalDate semanaInicio,
    LocalDate semanaFim,
    int agendados,
    int confirmados,
    int aConfirmar,
    int cancelados,
    int hoje
) {
}
