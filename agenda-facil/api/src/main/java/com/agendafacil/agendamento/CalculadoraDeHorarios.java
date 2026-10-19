package com.agendafacil.agendamento;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import com.agendafacil.horario.Expediente;

/**
 * O coração do produto: quais horários de um dia ainda estão livres para um serviço.
 *
 * Regra: os horários andam de acordo com a duração do serviço, a partir da abertura
 * (corte de 40 min: 09:00, 09:40, 10:20...) e recomeçam depois do almoço. Um horário entra
 * na lista se o serviço inteiro cabe antes do fechamento (ou do almoço), se ainda não passou
 * e se não encosta em nenhum agendamento ou bloqueio.
 *
 * Classe sem Spring e sem banco: recebe tudo pronto e devolve a lista. Por isso é fácil de testar.
 */
public final class CalculadoraDeHorarios {

    /** Para serviços muito curtos a lista não virar uma parede de botões. */
    static final int PASSO_MINIMO_MINUTOS = 15;

    private CalculadoraDeHorarios() {
    }

    public static List<LocalTime> horariosLivres(LocalDate dia, Expediente expediente, int duracaoMinutos,
            List<Intervalo> ocupados, Instant agora, ZoneId zona) {
        List<LocalTime> livres = new ArrayList<>();
        if (expediente == null) {
            return livres; // fechado nesse dia
        }
        int passo = Math.max(duracaoMinutos, PASSO_MINIMO_MINUTOS);

        for (int[] periodo : periodos(expediente)) {
            // minutos desde a meia-noite: evita o LocalTime "dar a volta" depois das 23:59
            for (int inicio = periodo[0]; inicio + duracaoMinutos <= periodo[1]; inicio += passo) {
                LocalTime horario = LocalTime.of(inicio / 60, inicio % 60);
                Instant comeca = dia.atTime(horario).atZone(zona).toInstant();
                Intervalo candidato = new Intervalo(comeca, comeca.plusSeconds(duracaoMinutos * 60L));
                if (comeca.isAfter(agora) && ocupados.stream().noneMatch(candidato::sobrepoe)) {
                    livres.add(horario);
                }
            }
        }
        return livres;
    }

    /** Manhã e tarde quando tem almoço; um período só quando não tem. */
    private static List<int[]> periodos(Expediente e) {
        if (!e.temAlmoco()) {
            return List.of(new int[] {minutos(e.abre()), minutos(e.fecha())});
        }
        return List.of(
            new int[] {minutos(e.abre()), minutos(e.almocoInicio())},
            new int[] {minutos(e.almocoFim()), minutos(e.fecha())});
    }

    private static int minutos(LocalTime hora) {
        return hora.getHour() * 60 + hora.getMinute();
    }
}
