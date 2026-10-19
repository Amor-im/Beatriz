package com.agendafacil.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class SegurancaConfigTest {

    @Test
    void recusaSegredoCurto() {
        assertThatThrownBy(() -> SegurancaConfig.validarSegredo("curto")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> SegurancaConfig.validarSegredo(null)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void recusaOSegredoDeExemploDoEnvExample() {
        assertThatThrownBy(() -> SegurancaConfig.validarSegredo("troque-por-um-segredo-aleatorio-com-pelo-menos-32-caracteres"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("valor de exemplo");
    }

    @Test
    void aceitaUmSegredoGerado() {
        assertThatCode(() -> SegurancaConfig.validarSegredo("q2kqLx0e9xP1gS3mZbT7wVf8yNcR4uHjD6aKoE5iWl0="))
            .doesNotThrowAnyException();
    }
}
