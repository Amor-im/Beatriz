package com.agendafacil.agendamento;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.bloqueio.BloqueioRepository;
import com.agendafacil.horario.Expediente;
import com.agendafacil.horario.HorarioService;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;

/**
 * Busca no banco o que o cálculo precisa (expediente, agendamentos e bloqueios)
 * e entrega para a CalculadoraDeHorarios. O front só mostra o resultado:
 * quem decide se um horário está livre é sempre o servidor.
 */
@Service
public class DisponibilidadeService {

    /** Até quantos dias para frente o cliente consegue marcar (hoje conta). */
    public static final int DIAS_A_FRENTE = 14;

    private final HorarioService horarios;
    private final AgendamentoRepository agendamentos;
    private final BloqueioRepository bloqueios;
    private final Clock relogio;

    public DisponibilidadeService(HorarioService horarios, AgendamentoRepository agendamentos,
            BloqueioRepository bloqueios, Clock relogio) {
        this.horarios = horarios;
        this.agendamentos = agendamentos;
        this.bloqueios = bloqueios;
        this.relogio = relogio;
    }

    public LocalDate hoje(Negocio negocio) {
        return LocalDate.now(relogio.withZone(negocio.zona()));
    }

    /** true se a data está entre hoje e o último dia da janela de agendamento. */
    public boolean dentroDaJanela(Negocio negocio, LocalDate dia) {
        LocalDate hoje = hoje(negocio);
        return !dia.isBefore(hoje) && dia.isBefore(hoje.plusDays(DIAS_A_FRENTE));
    }

    @Transactional(readOnly = true)
    public List<LocalTime> horariosLivres(Negocio negocio, Servico servico, LocalDate dia) {
        if (!dentroDaJanela(negocio, dia)) {
            return List.of();
        }
        Expediente expediente = horarios.expedientes(negocio.getId()).get(dia.getDayOfWeek());
        List<Intervalo> ocupados = ocupados(negocio, dia, dia.plusDays(1));
        return CalculadoraDeHorarios.horariosLivres(dia, expediente, servico.getDuracaoMinutos(),
            ocupados, relogio.instant(), negocio.zona());
    }

    /** A faixa de dias da página pública, com a situação de cada um. Duas consultas para os 14 dias. */
    @Transactional(readOnly = true)
    public List<DiaDisponivel> proximosDias(Negocio negocio, Servico servico) {
        LocalDate hoje = hoje(negocio);
        Map<DayOfWeek, Expediente> expedientes = horarios.expedientes(negocio.getId());
        List<Intervalo> ocupados = ocupados(negocio, hoje, hoje.plusDays(DIAS_A_FRENTE));
        Instant agora = relogio.instant();

        List<DiaDisponivel> dias = new ArrayList<>();
        for (int i = 0; i < DIAS_A_FRENTE; i++) {
            LocalDate dia = hoje.plusDays(i);
            Expediente expediente = expedientes.get(dia.getDayOfWeek());
            if (expediente == null) {
                dias.add(new DiaDisponivel(dia, DiaDisponivel.Situacao.FECHADO, 0));
                continue;
            }
            int livres = CalculadoraDeHorarios.horariosLivres(dia, expediente, servico.getDuracaoMinutos(),
                ocupados, agora, negocio.zona()).size();
            dias.add(new DiaDisponivel(dia, situacao(dia, expediente, servico, livres, agora, negocio), livres));
        }
        return dias;
    }

    /** Sem horário livre hoje porque o expediente já passou é "encerrado"; por causa de agendamentos, "lotado". */
    private static DiaDisponivel.Situacao situacao(LocalDate dia, Expediente expediente, Servico servico, int livres,
            Instant agora, Negocio negocio) {
        if (livres > 0) {
            return DiaDisponivel.Situacao.LIVRE;
        }
        boolean sobrouHorarioNoRelogio = !CalculadoraDeHorarios.horariosLivres(dia, expediente, servico.getDuracaoMinutos(),
            List.of(), agora, negocio.zona()).isEmpty();
        return sobrouHorarioNoRelogio ? DiaDisponivel.Situacao.LOTADO : DiaDisponivel.Situacao.ENCERRADO;
    }

    /**
     * O horário existe na grade do dia (está dentro do atendimento e alinhado com a duração do serviço),
     * sem olhar se está ocupado. Serve para separar "fora do horário" (422) de "já ocupado" (409).
     */
    @Transactional(readOnly = true)
    public boolean existeNaGrade(Negocio negocio, Servico servico, LocalDate dia, LocalTime horario) {
        Expediente expediente = horarios.expedientes(negocio.getId()).get(dia.getDayOfWeek());
        return CalculadoraDeHorarios.horariosLivres(dia, expediente, servico.getDuracaoMinutos(),
            List.of(), Instant.MIN, negocio.zona()).contains(horario);
    }

    /** Até 3 horários livres mais próximos do pedido: primeiro no mesmo dia, depois nos dias seguintes. */
    @Transactional(readOnly = true)
    public List<HorarioSugerido> sugestoes(Negocio negocio, Servico servico, LocalDate dia, LocalTime pedido) {
        int quantidade = 3;
        List<HorarioSugerido> sugestoes = new ArrayList<>(horariosLivres(negocio, servico, dia).stream()
            .sorted(Comparator.comparingInt(h -> Math.abs(h.toSecondOfDay() - pedido.toSecondOfDay())))
            .limit(quantidade)
            .sorted()
            .map(h -> new HorarioSugerido(dia, h))
            .toList());
        LocalDate proximo = dia.plusDays(1);
        while (sugestoes.size() < quantidade && dentroDaJanela(negocio, proximo)) {
            LocalDate data = proximo;
            horariosLivres(negocio, servico, data).stream()
                .limit(quantidade - sugestoes.size())
                .forEach(h -> sugestoes.add(new HorarioSugerido(data, h)));
            proximo = proximo.plusDays(1);
        }
        return sugestoes;
    }

    /** Agendamentos ativos e bloqueios do período, todos como intervalos de tempo. */
    private List<Intervalo> ocupados(Negocio negocio, LocalDate de, LocalDate ate) {
        ZoneId zona = negocio.zona();
        Instant inicio = de.atStartOfDay(zona).toInstant();
        Instant fim = ate.atStartOfDay(zona).toInstant();
        return Stream.concat(
            agendamentos.ativosEntre(negocio.getId(), inicio, fim).stream().map(a -> new Intervalo(a.getInicio(), a.getFim())),
            bloqueios.entre(negocio.getId(), inicio, fim).stream().map(b -> new Intervalo(b.getInicio(), b.getFim()))
        ).toList();
    }
}
