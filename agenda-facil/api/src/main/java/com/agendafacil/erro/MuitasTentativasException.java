package com.agendafacil.erro;

import java.time.Duration;

/** Limite de tentativas atingido (429). */
public class MuitasTentativasException extends RuntimeException {

    private final Duration esperar;

    public MuitasTentativasException(String mensagem, Duration esperar) {
        super(mensagem);
        this.esperar = esperar;
    }

    public Duration getEsperar() {
        return esperar;
    }
}
