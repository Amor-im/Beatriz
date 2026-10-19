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

    private ResultActions entrar(String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/entrar").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("email", email, "senha", senha))));
    }
}
