package com.agendafacil.integracao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import jakarta.servlet.http.Cookie;

class AuthIntegracaoTest extends TesteDeIntegracao {

    @Test
    void cadastroDevolveCookieHttpOnlyEDeixaLogado() throws Exception {
        Cookie sessao = criarConta("ana@example.com", "studio-ana");

        assertThat(sessao.isHttpOnly()).isTrue();
        mvc.perform(get("/api/auth/eu").cookie(sessao))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("ana@example.com"))
            .andExpect(jsonPath("$.negocio.slug").value("studio-ana"));
    }

    @Test
    void emailRepetidoRespondeConflito() throws Exception {
        criarConta("ana@example.com", "studio-ana");

        cadastrar("ANA@example.com", "outro-endereco")
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value(containsString("Já existe uma conta")));
    }

    @Test
    void enderecoReservadoOuInvalidoERecusado() throws Exception {
        cadastrar("ana@example.com", "painel").andExpect(status().isUnprocessableEntity());
        cadastrar("ana@example.com", "Com Espaço")
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.erros['negocio.slug']").exists());
    }

    @Test
    void senhaErradaEEmailInexistenteRecebemAMesmaMensagem() throws Exception {
        criarConta("ana@example.com", "studio-ana");

        String senhaErrada = entrar("ana@example.com", "senha-errada-123").andExpect(status().isUnauthorized())
            .andReturn().getResponse().getContentAsString();
        String semConta = entrar("ninguem@example.com", "senha-errada-123").andExpect(status().isUnauthorized())
            .andReturn().getResponse().getContentAsString();

        assertThat(senhaErrada).isEqualTo(semConta);
    }

    @Test
    void depoisDeCincoSenhasErradasAContaFicaBloqueadaPorUmTempo() throws Exception {
        criarConta("ana@example.com", "studio-ana");
        for (int i = 0; i < 5; i++) {
            entrar("ana@example.com", "senha-errada-123").andExpect(status().isUnauthorized());
        }

        // até a senha certa espera o bloqueio passar
        entrar("ana@example.com", "senha-de-teste-123")
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists(HttpHeaders.RETRY_AFTER));
    }

    @Test
    void tentativasDeCadastroRecusadasTambemContamNoLimite() throws Exception {
        criarConta("ana@example.com", "studio-ana");
        // usar um link já existente não cria conta, mas responde se o e-mail tem conta: por isso cada tentativa conta
        for (int i = 1; i < 10; i++) {
            cadastrar("pessoa" + i + "@example.com", "studio-ana").andExpect(status().isConflict());
        }

        cadastrar("mais-uma@example.com", "studio-ana").andExpect(status().isTooManyRequests());
    }

    @Test
    void senhasErradasDeOutraRedeNaoTrancamODonoForaDaConta() throws Exception {
        criarConta("ana@example.com", "studio-ana");
        for (int i = 0; i < 5; i++) {
            entrarDe("203.0.113.10", "ana@example.com", "senha-errada-123").andExpect(status().isUnauthorized());
        }

        entrarDe("203.0.113.10", "ana@example.com", "senha-de-teste-123").andExpect(status().isTooManyRequests());
        entrarDe("198.51.100.20", "ana@example.com", "senha-de-teste-123").andExpect(status().isOk());
    }

    @Test
    void loginCertoDevolveCookie() throws Exception {
        criarConta("ana@example.com", "studio-ana");

        entrar("ana@example.com", "senha-de-teste-123")
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=Lax")));
    }

    @Test
    void rotaDoPainelSemLoginResponde401EmJson() throws Exception {
        mvc.perform(get("/api/servicos"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.detail").value("Entre na sua conta para continuar."));
        mvc.perform(get("/api/agenda").header(HttpHeaders.AUTHORIZATION, "Bearer token-inventado"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void corsSoLiberaOFrontConfigurado() throws Exception {
        mvc.perform(get("/api/publico/negocios/qualquer").header(HttpHeaders.ORIGIN, "http://localhost:3000"))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
        mvc.perform(get("/api/publico/negocios/qualquer").header(HttpHeaders.ORIGIN, "https://site-de-outra-pessoa.example"))
            .andExpect(status().isForbidden());
    }

    @Test
    void sairApagaOCookie() throws Exception {
        mvc.perform(post("/api/auth/sair"))
            .andExpect(status().isNoContent())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));
    }

    private ResultActions cadastrar(String email, String slug) throws Exception {
        Map<String, Object> corpo = Map.of("nome", "Dono de exemplo", "email", email, "senha", "senha-de-teste-123",
            "negocio", Map.of("nome", "Negócio", "slug", slug, "whatsapp", "00900000000"));
        return mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(corpo)));
    }

    private ResultActions entrarDe(String ip, String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/entrar")
            .with(requisicao -> {
                requisicao.setRemoteAddr(ip);
                return requisicao;
            })
            .contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("email", email, "senha", senha))));
    }

    private ResultActions entrar(String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/entrar").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("email", email, "senha", senha))));
    }
}
