package com.agendafacil.auth;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.agendafacil.config.PropriedadesApp;

/**
 * O cookie que guarda o token de login do dono.
 *
 * - HttpOnly: o JavaScript da página não lê o cookie (um script injetado não rouba o login).
 * - SameSite=Lax: o navegador não manda o cookie em requisições que outro site dispara (POST, fetch).
 * - Secure: só trafega por HTTPS (ligado em produção pelo COOKIE_SEGURO).
 */
@Component
public class CookieDeSessao {

    public static final String NOME = "af_sessao";

    private final PropriedadesApp propriedades;

    public CookieDeSessao(PropriedadesApp propriedades) {
        this.propriedades = propriedades;
    }

    public ResponseCookie criar(String token) {
        return base(token).maxAge(propriedades.jwt().validade()).build();
    }

    /** Para sair: o mesmo cookie, vazio e já vencido. */
    public ResponseCookie limpar() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String valor) {
        ResponseCookie.ResponseCookieBuilder cookie = ResponseCookie.from(NOME, valor)
            .httpOnly(true)
            .secure(propriedades.cookie().seguro())
            .sameSite("Lax")
            .path("/");
        String dominio = propriedades.cookie().dominio();
        if (dominio != null && !dominio.isBlank()) {
            cookie.domain(dominio);
        }
        return cookie;
    }
}
