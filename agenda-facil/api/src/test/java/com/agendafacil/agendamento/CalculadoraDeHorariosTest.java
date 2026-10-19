package com.agendafacil.agendamento;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.agendafacil.horario.Expediente;

class CalculadoraDeHorariosTest {

    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");
    private static final LocalDate DIA = LocalDate.of(2030, 3, 5); // uma terça
    private static final Instant ANTES_DO_DIA = Instant.parse("2030-03-04T12:00:00Z");

    private static final Expediente NOVE_AS_DEZOITO_COM_ALMOCO =
        new Expediente(hora("09:00"), hora("18:00"), hora("12:00"), hora("13:00"));

    @Test
    void horariosAndamPelaDuracaoDoServicoERecomecamDepoisDoAlmoco() {
        List<LocalTime> livres = CalculadoraDeHorarios.horariosLivres(DIA, NOVE_AS_DEZOITO_COM_ALMOCO, 40,
            List.of(), ANTES_DO_DIA, SP);

        assertThat(livres).containsExactly(
            hora("09:00"), hora("09:40"), hora("10:20"), hora("11:00"),   // 11:40 não cabe antes do almoço
            hora("13:00"), hora("13:40"), hora("14:20"), hora("15:00"), hora("15:40"), hora("16:20"),
            hora("17:00"));                                                // 17:40 terminaria 18:20
    }

    @Test
    void horarioQueEncostaEmAgendamentoContinuaLivreMasOQueSobrepoeSai() {
        // agendamento das 10:00 às 10:40
        Intervalo ocupado = intervalo("10:00", "10:40");

        List<LocalTime> livres = CalculadoraDeHorarios.horariosLivres(DIA, NOVE_AS_DEZOITO_COM_ALMOCO, 40,
            List.of(ocupado), ANTES_DO_DIA, SP);

        assertThat(livres).doesNotContain(hora("09:40"), hora("10:20")) // 09:40–10:20 e 10:20–11:00 batem
            .contains(hora("09:00"), hora("11:00"));
    }

    @Test
    void naoMostraHorarioQueJaPassou() {
        Instant agora = DIA.atTime(hora("14:00")).atZone(SP).toInstant();

        List<LocalTime> livres = CalculadoraDeHorarios.horariosLivres(DIA, NOVE_AS_DEZOITO_COM_ALMOCO, 40,
            List.of(), agora, SP);

        assertThat(livres).first().isEqualTo(hora("14:20"));
    }

    @Test
    void diaFechadoNaoTemHorario() {
        assertThat(CalculadoraDeHorarios.horariosLivres(DIA, null, 40, List.of(), ANTES_DO_DIA, SP)).isEmpty();
    }

    @Test
    void servicoMaiorQueOExpedienteNaoTemHorario() {
        Expediente manha = new Expediente(hora("09:00"), hora("10:00"), null, null);

        assertThat(CalculadoraDeHorarios.horariosLivres(DIA, manha, 90, List.of(), ANTES_DO_DIA, SP)).isEmpty();
    }

    @Test
    void servicoCurtoUsaOPassoMinimo() {
        Expediente umaHora = new Expediente(hora("09:00"), hora("10:00"), null, null);

        List<LocalTime> livres = CalculadoraDeHorarios.horariosLivres(DIA, umaHora, 5, List.of(), ANTES_DO_DIA, SP);

        assertThat(livres).containsExactly(hora("09:00"), hora("09:15"), hora("09:30"), hora("09:45"));
    }

    @Test
    void expedienteAteMeiaNoiteNaoDaAVoltaNoRelogio() {
        Expediente noite = new Expediente(hora("22:00"), hora("23:59"), null, null);

        List<LocalTime> livres = CalculadoraDeHorarios.horariosLivres(DIA, noite, 60, List.of(), ANTES_DO_DIA, SP);

        assertThat(livres).containsExactly(hora("22:00"));
    }

    private static LocalTime hora(String texto) {
        return LocalTime.parse(texto);
    }

    private static Intervalo intervalo(String inicio, String fim) {
        return new Intervalo(DIA.atTime(hora(inicio)).atZone(SP).toInstant(), DIA.atTime(hora(fim)).atZone(SP).toInstant());
    }
}
