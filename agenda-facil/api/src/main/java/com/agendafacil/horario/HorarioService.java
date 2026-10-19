package com.agendafacil.horario;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;

@Service
public class HorarioService {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private final HorarioRepository horarios;
    private final NegocioService negocios;

    public HorarioService(HorarioRepository horarios, NegocioService negocios) {
        this.horarios = horarios;
        this.negocios = negocios;
    }

    /** Horário inicial de toda conta nova: segunda a sexta 9h às 18h com almoço, sábado 9h às 13h. O dono ajusta depois. */
    @Transactional
    public void criarPadrao(Negocio negocio) {
        Expediente semana = new Expediente(LocalTime.of(9, 0), LocalTime.of(18, 0), LocalTime.of(12, 0), LocalTime.of(13, 0));
        Expediente sabado = new Expediente(LocalTime.of(9, 0), LocalTime.of(13, 0), null, null);
        for (DayOfWeek dia : DayOfWeek.values()) {
            if (dia == DayOfWeek.SUNDAY) {
                continue;
            }
            horarios.save(new HorarioFuncionamento(negocio, dia, dia == DayOfWeek.SATURDAY ? sabado : semana));
        }
    }

    /** Os 7 dias, de segunda a domingo; os fechados vêm com aberto = false. */
    @Transactional(readOnly = true)
    public List<DiaResponse> semana(Long donoId) {
        Map<DayOfWeek, Expediente> expedientes = expedientes(negocios.doDono(donoId).getId());
        return IntStream.rangeClosed(1, 7).mapToObj(numero -> {
            Expediente e = expedientes.get(DayOfWeek.of(numero));
            return e == null ? DiaResponse.fechado(numero)
                : new DiaResponse(numero, true, e.abre(), e.fecha(), e.almocoInicio(), e.almocoFim());
        }).toList();
    }

    /**
     * Salva a semana. Atualiza o registro de cada dia no lugar (em vez de apagar tudo e inserir de novo),
     * o que respeita a regra "um registro por dia" do banco sem depender da ordem em que o JPA grava.
     */
    @Transactional
    public List<DiaResponse> salvar(Long donoId, HorariosRequest dados) {
        Negocio negocio = negocios.doDono(donoId);
        validar(dados.dias());

        Map<DayOfWeek, HorarioFuncionamento> atuais = new EnumMap<>(DayOfWeek.class);
        horarios.findByNegocioIdOrderByDiaSemanaAsc(negocio.getId()).forEach(h -> atuais.put(h.dia(), h));

        for (DiaRequest dia : dados.dias()) {
            DayOfWeek diaDaSemana = DayOfWeek.of(dia.diaSemana());
            HorarioFuncionamento atual = atuais.get(diaDaSemana);
            if (!dia.aberto()) {
                if (atual != null) {
                    horarios.delete(atual);
                }
                continue;
            }
            Expediente expediente = new Expediente(dia.abre(), dia.fecha(), dia.almocoInicio(), dia.almocoFim());
            if (atual == null) {
                horarios.save(new HorarioFuncionamento(negocio, diaDaSemana, expediente));
            } else {
                atual.atualizar(expediente);
            }
        }
        horarios.flush();
        return semana(donoId);
    }

    /** Expediente por dia da semana, usado no cálculo de horários livres. */
    @Transactional(readOnly = true)
    public Map<DayOfWeek, Expediente> expedientes(Long negocioId) {
        Map<DayOfWeek, Expediente> mapa = new EnumMap<>(DayOfWeek.class);
        horarios.findByNegocioIdOrderByDiaSemanaAsc(negocioId).forEach(h -> mapa.put(h.dia(), h.expediente()));
        return mapa;
    }

    private static void validar(List<DiaRequest> dias) {
        Set<Integer> vistos = new HashSet<>();
        for (DiaRequest dia : dias) {
            if (!vistos.add(dia.diaSemana())) {
                throw new RegraDeNegocioException("Cada dia da semana só pode aparecer uma vez.");
            }
            if (!dia.aberto()) {
                continue;
            }
            String nome = DayOfWeek.of(dia.diaSemana()).getDisplayName(TextStyle.FULL, PT_BR);
            if (dia.abre() == null || dia.fecha() == null) {
                throw new RegraDeNegocioException("Informe a abertura e o fechamento de " + nome + ".");
            }
            if (!dia.fecha().isAfter(dia.abre())) {
                throw new RegraDeNegocioException("Em " + nome + ", o fechamento precisa ser depois da abertura.");
            }
            boolean temInicio = dia.almocoInicio() != null;
            boolean temFim = dia.almocoFim() != null;
            if (temInicio != temFim) {
                throw new RegraDeNegocioException("Em " + nome + ", informe o início e o fim do almoço, ou deixe os dois vazios.");
            }
            if (temInicio && (dia.almocoInicio().isBefore(dia.abre()) || dia.almocoFim().isAfter(dia.fecha())
                    || !dia.almocoFim().isAfter(dia.almocoInicio()))) {
                throw new RegraDeNegocioException("Em " + nome + ", o almoço precisa ficar dentro do horário de atendimento.");
            }
        }
    }
}
