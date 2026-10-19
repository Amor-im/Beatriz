package com.agendafacil.agendamento;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;

class IcsGeradorTest {

    @Test
    void geraUmEventoValidoComHorarioEmUtc() {
        Negocio negocio = new Negocio(null, "Studio Exemplo", "studio-exemplo", "00900000000", "Rua Exemplo, 123; Centro");
        Servico servico = new Servico(negocio, "Corte", 40, null, true);
        Instant inicio = Instant.parse("2030-03-05T13:20:00Z");
        Agendamento agendamento = new Agendamento(negocio, servico, "Cliente de exemplo", "00900000000",
            inicio, inicio.plusSeconds(40 * 60));

        String ics = IcsGerador.gerar(agendamento, negocio, servico, Instant.parse("2030-03-04T11:00:00Z"));

        assertThat(ics).startsWith("BEGIN:VCALENDAR\r\n").endsWith("END:VCALENDAR\r\n")
            .contains("DTSTART:20300305T132000Z\r\n", "DTEND:20300305T140000Z\r\n")
            .contains("LOCATION:Rua Exemplo\\, 123\\; Centro")
            .contains("UID:" + agendamento.getCodigo() + "@agenda-facil");
        // nenhuma linha passa de 75 bytes (as longas são dobradas)
        for (String linha : ics.split("\r\n")) {
            assertThat(linha.getBytes(StandardCharsets.UTF_8).length).isLessThanOrEqualTo(75);
        }
    }

    @Test
    void escapaOsCaracteresEspeciaisDoFormato() {
        assertThat(IcsGerador.escapar("a,b;c\\d\ne")).isEqualTo("a\\,b\\;c\\\\d\\ne");
    }
}
