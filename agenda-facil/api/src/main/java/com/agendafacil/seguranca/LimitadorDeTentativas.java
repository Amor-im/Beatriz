package com.agendafacil.seguranca;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Limite simples de tentativas por chave (por exemplo "login:ip:email"), numa janela de tempo.
 * Guarda os horários das tentativas em memória: suficiente para uma instância só.
 * Com várias instâncias da API, isso iria para um lugar compartilhado (Redis, por exemplo).
 */
@Component
public class LimitadorDeTentativas {

    private final Clock relogio;
    private final Map<String, Deque<Instant>> tentativas = new ConcurrentHashMap<>();

    public LimitadorDeTentativas(Clock relogio) {
        this.relogio = relogio;
    }

    /** true se a chave já fez "maximo" tentativas dentro da janela. */
    public boolean excedeu(String chave, int maximo, Duration janela) {
        Deque<Instant> registros = tentativas.get(chave);
        if (registros == null) {
            return false;
        }
        synchronized (registros) {
            descartarAntigas(registros, janela);
            return registros.size() >= maximo;
        }
    }

    public void registrar(String chave, Duration janela) {
        Deque<Instant> registros = tentativas.computeIfAbsent(chave, k -> new ArrayDeque<>());
        synchronized (registros) {
            descartarAntigas(registros, janela);
            registros.addLast(relogio.instant());
        }
    }

    public void limpar(String chave) {
        tentativas.remove(chave);
    }

    /** Zera todos os contadores (usado entre um teste e outro). */
    public void limparTudo() {
        tentativas.clear();
    }

    private void descartarAntigas(Deque<Instant> registros, Duration janela) {
        Instant limite = relogio.instant().minus(janela);
        while (!registros.isEmpty() && registros.peekFirst().isBefore(limite)) {
            registros.pollFirst();
        }
    }
}
