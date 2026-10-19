package com.agendafacil.agendamento;

import java.time.LocalDate;

/** Um dia na faixa de datas da página pública. */
public record DiaDisponivel(LocalDate data, Situacao situacao, int livres) {

    public enum Situacao {
        /** Tem pelo menos um horário livre. */
        LIVRE,
        /** Abre nesse dia, mas os horários livres já foram ocupados. */
        LOTADO,
        /** É hoje e o horário de atendimento já passou. */
        ENCERRADO,
        /** Não abre nesse dia. */
        FECHADO
    }
}
