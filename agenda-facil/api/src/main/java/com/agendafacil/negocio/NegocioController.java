package com.agendafacil.negocio;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.seguranca.DonoLogado;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/negocio")
@Tag(name = "Painel · Negócio")
@SecurityRequirement(name = "token")
public class NegocioController {

    private final NegocioService servico;

    public NegocioController(NegocioService servico) {
        this.servico = servico;
    }

    @GetMapping
    public NegocioResponse meuNegocio(@AuthenticationPrincipal Jwt token) {
        return NegocioResponse.de(servico.doDono(DonoLogado.id(token)));
    }

    @PutMapping
    public NegocioResponse atualizar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody NegocioRequest dados) {
        return servico.atualizar(DonoLogado.id(token), dados);
    }
}
