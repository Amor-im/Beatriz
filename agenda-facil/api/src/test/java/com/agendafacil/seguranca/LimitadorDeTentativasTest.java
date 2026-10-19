package com.agendafacil.seguranca;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

class LimitadorDeTentativasTest {

    /** Relógio que o teste consegue adiantar. */
    private static final class RelogioDeTeste extends Clock {
        private Instant agora = Instant.parse("2030-03-04T11:00:00Z");

        void avancar(Duration tempo) {
            agora = agora.plus(tempo);
        }

        @Override
        public Instant instant() {
            return agora;
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }

    @Test
    void bloqueiaDepoisDoMaximoEDesbloqueiaQuandoAJanelaPassa() {
        RelogioDeTeste relogio = new RelogioDeTeste();
        LimitadorDeTentativas limitador = new LimitadorDeTentativas(relogio);
        Duration janela = Duration.ofMinutes(15);

        for (int i = 0; i < 5; i++) {
            assertThat(limitador.excedeu("entrar:email:a@example.com", 5, janela)).isFalse();
            limitador.registrar("entrar:email:a@example.com", janela);
        }
        assertThat(limitador.excedeu("entrar:email:a@example.com", 5, janela)).isTrue();
        assertThat(limitador.excedeu("entrar:email:b@example.com", 5, janela)).isFalse();

        relogio.avancar(Duration.ofMinutes(16));
        assertThat(limitador.excedeu("entrar:email:a@example.com", 5, janela)).isFalse();
    }

    @Test
    void chavesSemTentativaRecenteSaemDaMemoria() {
        RelogioDeTeste relogio = new RelogioDeTeste();
        LimitadorDeTentativas limitador = new LimitadorDeTentativas(relogio);
        limitador.registrar("antiga", Duration.ofMinutes(15));
        relogio.avancar(Duration.ofMinutes(50));
        limitador.registrar("recente", Duration.ofMinutes(15));
        relogio.avancar(Duration.ofMinutes(20)); // "antiga" tem 70 min; "recente", 20 min

        limitador.limparVencidas();

        assertThat(limitador.quantidadeDeChaves()).isEqualTo(1);
    }

    @Test
    void limparZeraAChave() {
        LimitadorDeTentativas limitador = new LimitadorDeTentativas(new RelogioDeTeste());
        limitador.registrar("x", Duration.ofMinutes(1));
        limitador.limpar("x");
        assertThat(limitador.excedeu("x", 1, Duration.ofMinutes(1))).isFalse();
    }
}
