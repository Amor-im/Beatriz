package com.agendafacil.seguranca;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Limite simples de tentativas por chave (por exemplo "login:ip:email"), numa janela de tempo.
 * Guarda os horários das tentativas em memória: suficiente para uma instância só.
 * Com várias instâncias da API, isso iria para um lugar compartilhado (Redis, por exemplo).
 */
@Component
public class LimitadorDeTentativas {

    /** A maior janela usada no projeto (cadastro: 1 hora). Tentativa mais antiga que isso não conta para nada. */
    static final Duration MAIOR_JANELA = Duration.ofHours(1);

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

    /**
     * A cada 10 minutos, apaga as chaves sem tentativa recente. Sem isso, cada IP novo
     * ficaria guardado para sempre e a memória cresceria sem limite.
     */
    @Scheduled(fixedDelay = 10, timeUnit = TimeUnit.MINUTES)
    public void limparVencidas() {
        Instant limite = relogio.instant().minus(MAIOR_JANELA);
        tentativas.entrySet().removeIf(entrada -> {
            synchronized (entrada.getValue()) {
                Instant ultima = entrada.getValue().peekLast();
                return ultima == null || ultima.isBefore(limite);
            }
        });
    }

    /** Quantas chaves estão guardadas (usado nos testes). */
    int quantidadeDeChaves() {
        return tentativas.size();
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
