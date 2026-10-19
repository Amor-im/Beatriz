package com.agendafacil.auth;

import java.time.Clock;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.agendafacil.config.PropriedadesApp;

/**
 * Gera o JWT do dono depois do login.
 * O token é assinado com o JWT_SEGREDO (HS256): se alguém alterar qualquer parte,
 * a assinatura não bate e o Spring Security recusa. Ele não é criptografado, então
 * só leva o id e o e-mail, nada sensível.
 */
@Service
public class TokenService {

    private final JwtEncoder codificador;
    private final PropriedadesApp propriedades;
    private final Clock relogio;

    public TokenService(JwtEncoder codificador, PropriedadesApp propriedades, Clock relogio) {
        this.codificador = codificador;
        this.propriedades = propriedades;
        this.relogio = relogio;
    }

    public String gerar(Dono dono) {
        Instant agora = relogio.instant();
        JwtClaimsSet dados = JwtClaimsSet.builder()
            .issuer("agenda-facil")
            .subject(dono.getId().toString())
            .claim("email", dono.getEmail())
            .issuedAt(agora)
            .expiresAt(agora.plus(propriedades.jwt().validade()))
            .build();
        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        return codificador.encode(JwtEncoderParameters.from(cabecalho, dados)).getTokenValue();
    }
}
