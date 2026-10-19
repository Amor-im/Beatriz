package com.agendafacil.horario;

import java.util.List;

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
@RequestMapping("/api/horarios")
@Tag(name = "Painel · Horários de atendimento")
@SecurityRequirement(name = "token")
public class HorarioController {

    private final HorarioService servico;

    public HorarioController(HorarioService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<DiaResponse> semana(@AuthenticationPrincipal Jwt token) {
        return servico.semana(DonoLogado.id(token));
    }

    @PutMapping
    public List<DiaResponse> salvar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody HorariosRequest dados) {
        return servico.salvar(DonoLogado.id(token), dados);
    }
}
