package com.agendafacil.auth;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioResponse;

/** Quem está logado e qual é o negócio dele. O token não vem aqui: vai só no cookie HttpOnly. */
public record SessaoResponse(Long donoId, String nome, String email, NegocioResponse negocio) {

    public static SessaoResponse de(Dono dono, Negocio negocio) {
        return new SessaoResponse(dono.getId(), dono.getNome(), dono.getEmail(), NegocioResponse.de(negocio));
    }
}
