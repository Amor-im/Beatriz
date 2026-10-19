package com.agendafacil.servico;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.seguranca.DonoLogado;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/servicos")
@Tag(name = "Painel · Serviços")
@SecurityRequirement(name = "token")
public class ServicoController {

    private final ServicoService servico;

    public ServicoController(ServicoService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<ServicoResponse> listar(@AuthenticationPrincipal Jwt token) {
        return servico.listar(DonoLogado.id(token));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServicoResponse criar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody ServicoRequest dados) {
        return servico.criar(DonoLogado.id(token), dados);
    }

    @PutMapping("/{id}")
    public ServicoResponse atualizar(@AuthenticationPrincipal Jwt token, @PathVariable Long id,
            @Valid @RequestBody ServicoRequest dados) {
        return servico.atualizar(DonoLogado.id(token), id, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        servico.excluir(DonoLogado.id(token), id);
    }
}
