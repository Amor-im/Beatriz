package com.agendafacil.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.seguranca.DonoLogado;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Conta do dono")
public class AuthController {

    private final AuthService servico;
    private final CookieDeSessao cookie;

    public AuthController(AuthService servico, CookieDeSessao cookie) {
        this.servico = servico;
        this.cookie = cookie;
    }

    @PostMapping("/cadastro")
    @Operation(summary = "Cria a conta do dono e o negócio, e já deixa logado")
    public ResponseEntity<SessaoResponse> cadastrar(@Valid @RequestBody CadastroRequest dados, HttpServletRequest requisicao) {
        AuthService.Login login = servico.cadastrar(dados, requisicao.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
            .header(HttpHeaders.SET_COOKIE, cookie.criar(login.token()).toString())
            .body(login.sessao());
    }

    @PostMapping("/entrar")
    @Operation(summary = "Login com e-mail e senha. O token volta num cookie HttpOnly")
    public ResponseEntity<SessaoResponse> entrar(@Valid @RequestBody EntrarRequest dados, HttpServletRequest requisicao) {
        AuthService.Login login = servico.entrar(dados, requisicao.getRemoteAddr());
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.criar(login.token()).toString())
            .body(login.sessao());
    }

    @PostMapping("/sair")
    @Operation(summary = "Apaga o cookie de sessão")
    public ResponseEntity<Void> sair() {
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.limpar().toString())
            .build();
    }

    @GetMapping("/eu")
    @Operation(summary = "Quem está logado")
    @SecurityRequirement(name = "token")
    public SessaoResponse eu(@AuthenticationPrincipal Jwt token) {
        return servico.sessao(DonoLogado.id(token));
    }
}
