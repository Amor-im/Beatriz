package com.agendafacil.agendamento;

import java.time.LocalDate;

/** Um dia na faixa de datas da página pública. */
public record DiaDisponivel(LocalDate data, Situacao situacao, int livres) {

    public enum Situacao {
        /** Tem pelo menos um horário livre. */
        LIVRE,
        /** Abre nesse dia, mas não sobrou horário (ou o dia já acabou). */
        LOTADO,
        /** Não abre nesse dia. */
        FECHADO
    }
}
