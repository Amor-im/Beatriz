package com.agendafacil.agendamento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

import com.agendafacil.config.PropriedadesApp;
import com.agendafacil.erro.ConflitoException;
import com.agendafacil.erro.MuitasTentativasException;
import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;
import com.agendafacil.seguranca.LimitadorDeTentativas;
import com.agendafacil.servico.Servico;
import com.agendafacil.servico.ServicoService;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");
    // segunda-feira, 4 de março de 2030, 08:00 em São Paulo
    private static final Clock SEGUNDA_8H = Clock.fixed(Instant.parse("2030-03-04T11:00:00Z"), ZoneId.of("UTC"));
    private static final LocalDate TERCA = LocalDate.of(2030, 3, 5);
    private static final LocalTime DEZ_E_VINTE = LocalTime.of(10, 20);
    private static final int LIMITE = 10;

    @Mock
    private AgendamentoRepository agendamentos;
    @Mock
    private NegocioService negocios;
    @Mock
    private ServicoService servicos;
    @Mock
    private DisponibilidadeService disponibilidade;

    private AgendamentoService servico;
    private Negocio negocio;
    private Servico corte;

    @BeforeEach
    void preparar() {
        servico = new AgendamentoService(agendamentos, negocios, servicos, disponibilidade,
            new LimitadorDeTentativas(SEGUNDA_8H), new PropriedadesApp(null, null, null, new PropriedadesApp.Limites(LIMITE)),
            SEGUNDA_8H);
        negocio = new Negocio(null, "Studio Exemplo", "studio-exemplo", "00900000000", null);
        ReflectionTestUtils.setField(negocio, "id", 1L);
        corte = new Servico(negocio, "Corte", 40, 4500, true);
        ReflectionTestUtils.setField(corte, "id", 7L);
    }

    @Test
    void agendaQuandoOHorarioEstaLivre() {
        quandoOHorarioEstiverNaLista(true);

        AgendamentoPublicoResponse resposta = servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "1.1.1.1");

        ArgumentCaptor<Agendamento> gravado = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentos).saveAndFlush(gravado.capture());
        assertThat(gravado.getValue().getInicio()).isEqualTo(TERCA.atTime(DEZ_E_VINTE).atZone(SP).toInstant());
        assertThat(gravado.getValue().getFim()).isEqualTo(TERCA.atTime(11, 0).atZone(SP).toInstant());
        assertThat(gravado.getValue().getClienteWhatsapp()).isEqualTo("11987654321");
        assertThat(resposta.status()).isEqualTo(StatusAgendamento.A_CONFIRMAR);
        assertThat(resposta.inicio()).isEqualTo(DEZ_E_VINTE);
        assertThat(resposta.fim()).isEqualTo(LocalTime.of(11, 0));
    }

    @Test
    void horarioOcupadoRespondeConflitoComSugestoesESemGravar() {
        quandoOHorarioEstiverNaLista(false);
        when(disponibilidade.existeNaGrade(negocio, corte, TERCA, DEZ_E_VINTE)).thenReturn(true);
        List<HorarioSugerido> sugestoes = List.of(new HorarioSugerido(TERCA, LocalTime.of(11, 0)));
        when(disponibilidade.sugestoes(negocio, corte, TERCA, DEZ_E_VINTE)).thenReturn(sugestoes);

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "1.1.1.1"))
            .isInstanceOf(ConflitoException.class)
            .hasMessageContaining("acabou de ser reservado")
            .satisfies(erro -> assertThat(((ConflitoException) erro).getExtras()).containsEntry("horariosProximos", sugestoes));
        verify(agendamentos, never()).saveAndFlush(any());
    }

    @Test
    void horarioForaDoAtendimentoERecusadoComoRegraDeNegocio() {
        quandoOHorarioEstiverNaLista(false);
        LocalTime vinteEDuas = LocalTime.of(22, 0);
        when(disponibilidade.horariosLivres(negocio, corte, TERCA)).thenReturn(List.of(DEZ_E_VINTE));
        when(disponibilidade.existeNaGrade(negocio, corte, TERCA, vinteEDuas)).thenReturn(false);

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(TERCA, vinteEDuas), "1.1.1.1"))
            .isInstanceOf(RegraDeNegocioException.class)
            .hasMessageContaining("fora do atendimento");
        verify(agendamentos, never()).saveAndFlush(any());
    }

    @Test
    void horarioQueJaPassouERecusado() {
        when(negocios.porSlug("studio-exemplo")).thenReturn(negocio);
        when(servicos.ativoDoNegocio(1L, 7L)).thenReturn(corte);
        LocalDate segunda = LocalDate.of(2030, 3, 4);

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(segunda, LocalTime.of(7, 0)), "1.1.1.1"))
            .isInstanceOf(RegraDeNegocioException.class)
            .hasMessageContaining("já passou");
    }

    @Test
    void quandoOBancoRecusaPorSobreposicaoViraConflito() {
        // duas pessoas passaram pela checagem ao mesmo tempo; o banco deixa só a primeira gravar
        quandoOHorarioEstiverNaLista(true);
        when(agendamentos.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("erro",
            new SQLException("conflicting key value violates exclusion constraint \"agendamento_sem_sobreposicao\"")));
        when(disponibilidade.sugestoes(negocio, corte, TERCA, DEZ_E_VINTE)).thenReturn(List.of());

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "1.1.1.1"))
            .isInstanceOf(ConflitoException.class);
    }

    @Test
    void outraRegraDoBancoNaoEConfundidaComHorarioOcupado() {
        quandoOHorarioEstiverNaLista(true);
        when(agendamentos.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("erro",
            new SQLException("violates foreign key constraint \"agendamento_servico_id_fkey\"")));

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "1.1.1.1"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void limitaAsTentativasPorIp() {
        quandoOHorarioEstiverNaLista(true);
        for (int i = 0; i < LIMITE; i++) {
            servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "2.2.2.2");
        }

        assertThatThrownBy(() -> servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "2.2.2.2"))
            .isInstanceOf(MuitasTentativasException.class);
        // outro IP continua conseguindo
        servico.agendar("studio-exemplo", pedido(TERCA, DEZ_E_VINTE), "3.3.3.3");
    }

    private void quandoOHorarioEstiverNaLista(boolean livre) {
        when(negocios.porSlug("studio-exemplo")).thenReturn(negocio);
        when(servicos.ativoDoNegocio(1L, 7L)).thenReturn(corte);
        when(disponibilidade.dentroDaJanela(any(), any())).thenReturn(true);
        if (livre) {
            when(disponibilidade.horariosLivres(negocio, corte, TERCA)).thenReturn(List.of(DEZ_E_VINTE));
        } else {
            when(disponibilidade.horariosLivres(negocio, corte, TERCA)).thenReturn(List.of());
        }
    }

    private static NovoAgendamentoRequest pedido(LocalDate data, LocalTime horario) {
        return new NovoAgendamentoRequest(7L, data, horario, "Cliente de exemplo", "(11) 98765-4321");
    }
}
