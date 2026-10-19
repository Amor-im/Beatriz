package com.agendafacil.bloqueio;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.seguranca.DonoLogado;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bloqueios")
@Tag(name = "Painel · Bloqueios")
@SecurityRequirement(name = "token")
public class BloqueioController {

    private final BloqueioService servico;

    public BloqueioController(BloqueioService servico) {
        this.servico = servico;
    }

    /** Sem datas: de hoje até 60 dias para frente. */
    @GetMapping
    public List<BloqueioResponse> listar(@AuthenticationPrincipal Jwt token,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return servico.listar(DonoLogado.id(token), de, ate);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BloqueioResponse criar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody BloqueioRequest dados) {
        return servico.criar(DonoLogado.id(token), dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        servico.excluir(DonoLogado.id(token), id);
    }
}
