package com.agendafacil.agendamento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.agendafacil.bloqueio.Bloqueio;
import com.agendafacil.bloqueio.BloqueioRepository;
import com.agendafacil.horario.Expediente;
import com.agendafacil.horario.HorarioService;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;

@ExtendWith(MockitoExtension.class)
class DisponibilidadeServiceTest {

    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");
    // segunda-feira, 4 de março de 2030, 08:00 em São Paulo
    private static final Clock SEGUNDA_8H = Clock.fixed(Instant.parse("2030-03-04T11:00:00Z"), ZoneId.of("UTC"));
    private static final LocalDate TERCA = LocalDate.of(2030, 3, 5);

    @Mock
    private HorarioService horarios;
    @Mock
    private AgendamentoRepository agendamentos;
    @Mock
    private BloqueioRepository bloqueios;

    private DisponibilidadeService disponibilidade;
    private Negocio negocio;
    private Servico corte;

    @BeforeEach
    void preparar() {
        disponibilidade = new DisponibilidadeService(horarios, agendamentos, bloqueios, SEGUNDA_8H);
        negocio = new Negocio(null, "Studio Exemplo", "studio-exemplo", "00900000000", null);
        ReflectionTestUtils.setField(negocio, "id", 1L);
        corte = new Servico(negocio, "Corte", 60, null, true);
    }

    @Test
    void tiraDaListaOsHorariosComAgendamentoEComBloqueio() {
        abreDeSegundaASabado(new Expediente(hora("09:00"), hora("12:00"), null, null));
        Agendamento marcado = agendamentoNaTerca("09:00", "10:00");
        Bloqueio folga = new Bloqueio(negocio, emSp(TERCA, "11:00"), emSp(TERCA, "12:00"), "Compromisso");
        when(agendamentos.ativosEntre(anyLong(), any(), any())).thenReturn(List.of(marcado));
        when(bloqueios.entre(anyLong(), any(), any())).thenReturn(List.of(folga));

        List<LocalTime> livres = disponibilidade.horariosLivres(negocio, corte, TERCA);

        assertThat(livres).containsExactly(hora("10:00"));
    }

    @Test
    void dataForaDaJanelaDeAgendamentoNaoConsultaOBanco() {
        LocalDate muitoLonge = LocalDate.of(2030, 3, 4).plusDays(DisponibilidadeService.DIAS_A_FRENTE);
        LocalDate ontem = LocalDate.of(2030, 3, 3);

        assertThat(disponibilidade.horariosLivres(negocio, corte, muitoLonge)).isEmpty();
        assertThat(disponibilidade.horariosLivres(negocio, corte, ontem)).isEmpty();
        verifyNoInteractions(agendamentos, bloqueios);
    }

    @Test
    void proximosDiasMostraFechadoLotadoELivre() {
        abreDeSegundaASabado(new Expediente(hora("09:00"), hora("10:00"), null, null));
        // terça lotada: o único horário (09:00–10:00) já tem cliente
        when(agendamentos.ativosEntre(anyLong(), any(), any())).thenReturn(List.of(agendamentoNaTerca("09:00", "10:00")));
        when(bloqueios.entre(anyLong(), any(), any())).thenReturn(List.of());

        List<DiaDisponivel> dias = disponibilidade.proximosDias(negocio, corte);

        assertThat(dias).hasSize(DisponibilidadeService.DIAS_A_FRENTE);
        assertThat(dias.get(0).situacao()).isEqualTo(DiaDisponivel.Situacao.LIVRE);   // segunda, 09:00 ainda não passou
        assertThat(dias.get(1).situacao()).isEqualTo(DiaDisponivel.Situacao.LOTADO);  // terça
        assertThat(dias.get(6).situacao()).isEqualTo(DiaDisponivel.Situacao.FECHADO); // domingo
    }

    @Test
    void sugereOsHorariosLivresMaisProximosDoPedido() {
        abreDeSegundaASabado(new Expediente(hora("09:00"), hora("15:00"), null, null));
        when(agendamentos.ativosEntre(anyLong(), any(), any())).thenReturn(List.of(agendamentoNaTerca("11:00", "12:00")));
        when(bloqueios.entre(anyLong(), any(), any())).thenReturn(List.of());

        List<HorarioSugerido> sugestoes = disponibilidade.sugestoes(negocio, corte, TERCA, hora("11:00"));

        assertThat(sugestoes).extracting(HorarioSugerido::horario)
            .containsExactly(hora("09:00"), hora("10:00"), hora("12:00"));
    }

    private void abreDeSegundaASabado(Expediente expediente) {
        Map<DayOfWeek, Expediente> semana = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek dia : DayOfWeek.values()) {
            if (dia != DayOfWeek.SUNDAY) {
                semana.put(dia, expediente);
            }
        }
        when(horarios.expedientes(1L)).thenReturn(semana);
    }

    private Agendamento agendamentoNaTerca(String inicio, String fim) {
        return new Agendamento(negocio, corte, "Cliente de exemplo", "00900000000", emSp(TERCA, inicio), emSp(TERCA, fim));
    }

    private static Instant emSp(LocalDate dia, String hora) {
        return dia.atTime(LocalTime.parse(hora)).atZone(SP).toInstant();
    }

    private static LocalTime hora(String texto) {
        return LocalTime.parse(texto);
    }
}
