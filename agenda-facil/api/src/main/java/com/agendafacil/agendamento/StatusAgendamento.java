package com.agendafacil.agendamento;

public enum StatusAgendamento {
    /** O cliente marcou pela página; o horário já fica reservado, falta o dono confirmar. */
    A_CONFIRMAR,
    CONFIRMADO,
    /** Cancelado libera o horário de novo. */
    CANCELADO
}
