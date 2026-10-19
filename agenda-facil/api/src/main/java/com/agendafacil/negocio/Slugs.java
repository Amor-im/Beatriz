package com.agendafacil.negocio;

import java.util.Set;

import com.agendafacil.erro.RegraDeNegocioException;

/** Regras do "slug", o endereço público do negócio (agendafacil.com/studio-exemplo). */
public final class Slugs {

    /** Palavras que já são rotas do site e não podem virar endereço de negócio. */
    private static final Set<String> RESERVADOS = Set.of(
        "api", "painel", "entrar", "cadastro", "sair", "admin", "conta", "ajuda",
        "confirmado", "agendamento", "agendamentos", "publico", "termos", "privacidade");

    private Slugs() {
    }

    public static void validarNaoReservado(String slug) {
        if (RESERVADOS.contains(slug)) {
            throw new RegraDeNegocioException("Esse endereço é reservado pelo sistema. Escolha outro.");
        }
    }
}
