package com.agendafacil.seguranca;

import org.springframework.security.oauth2.jwt.Jwt;

/** Lê o id do dono de dentro do token já validado pelo Spring Security (campo "sub"). */
public final class DonoLogado {

    private DonoLogado() {
    }

    public static Long id(Jwt token) {
        return Long.valueOf(token.getSubject());
    }
}
