package com.agendafacil.agendamento;

import java.time.Instant;

/** Um pedaço de tempo [inicio, fim): começa em "inicio" e termina logo antes de "fim". */
public record Intervalo(Instant inicio, Instant fim) {

    /** 10:00–10:40 e 10:40–11:20 não se sobrepõem: um termina quando o outro começa. */
    public boolean sobrepoe(Intervalo outro) {
        return inicio.isBefore(outro.fim) && outro.inicio.isBefore(fim);
    }
}
