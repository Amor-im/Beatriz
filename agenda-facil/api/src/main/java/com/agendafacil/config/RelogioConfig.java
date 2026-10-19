package com.agendafacil.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Um relógio injetável: o código pergunta "que horas são?" para este bean, e não para o sistema.
 * Nos testes, troco por um relógio parado (Clock.fixed) e as regras de horário ficam previsíveis.
 */
@Configuration
public class RelogioConfig {

    @Bean
    public Clock relogio() {
        return Clock.systemUTC();
    }
}
