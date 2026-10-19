package com.agendafacil.agendamento;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.seguranca.DonoLogado;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/agenda")
@Tag(name = "Painel · Agenda")
@SecurityRequirement(name = "token")
public class AgendaController {

    private final AgendaService servico;

    public AgendaController(AgendaService servico) {
        this.servico = servico;
    }

    @GetMapping
    @Operation(summary = "Agendamentos e bloqueios de um período (até 31 dias). Sem datas: hoje")
    public AgendaResponse agenda(@AuthenticationPrincipal Jwt token,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return servico.agenda(DonoLogado.id(token), de, ate);
    }

    @GetMapping("/resumo")
    @Operation(summary = "Contador da semana atual")
    public ResumoSemanaResponse resumo(@AuthenticationPrincipal Jwt token) {
        return servico.resumo(DonoLogado.id(token));
    }

    @PatchMapping("/{id}/confirmar")
    public AgendamentoResponse confirmar(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        return servico.confirmar(DonoLogado.id(token), id);
    }

    @PatchMapping("/{id}/cancelar")
    public AgendamentoResponse cancelar(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        return servico.cancelar(DonoLogado.id(token), id);
    }
}
