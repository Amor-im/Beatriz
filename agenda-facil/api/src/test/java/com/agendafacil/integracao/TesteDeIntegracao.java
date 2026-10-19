package com.agendafacil.integracao;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.agendafacil.auth.CookieDeSessao;
import com.agendafacil.seguranca.LimitadorDeTentativas;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base dos testes de integração: sobe a aplicação inteira com um PostgreSQL 16 de verdade
 * num container descartável (Testcontainers). As migrations do Flyway rodam nele, então a
 * regra de "sem sobreposição" do banco também é testada. Sem Docker, esses testes são pulados.
 *
 * O relógio fica parado numa segunda-feira, 4 de março de 2030, às 08:00 em São Paulo,
 * para os testes não dependerem do dia em que rodam.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@Import(TesteDeIntegracao.Infraestrutura.class)
abstract class TesteDeIntegracao {

    static final Instant AGORA = Instant.parse("2030-03-04T11:00:00Z");

    @TestConfiguration(proxyBeanMethods = false)
    static class Infraestrutura {

        /** O container vive junto com o contexto do Spring, que é reaproveitado por todas as classes de teste. */
        @Bean
        @ServiceConnection
        PostgreSQLContainer<?> banco() {
            return new PostgreSQLContainer<>("postgres:16-alpine");
        }

        @Bean
        @Primary
        Clock relogioDeTeste() {
            return Clock.fixed(AGORA, ZoneId.of("UTC"));
        }
    }

    @Autowired
    protected MockMvc mvc;
    @Autowired
    protected ObjectMapper json;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private LimitadorDeTentativas limitador;

    @BeforeEach
    void limparBanco() {
        // apaga o dono e, em cascata, negócio, serviços, horários, bloqueios e agendamentos
        jdbc.execute("TRUNCATE dono RESTART IDENTITY CASCADE");
        limitador.limparTudo();
    }

    /** Cria uma conta pela API e devolve o cookie de sessão. */
    protected Cookie criarConta(String email, String slug) throws Exception {
        Map<String, Object> corpo = Map.of(
            "nome", "Dono de exemplo",
            "email", email,
            "senha", "senha-de-teste-123",
            "negocio", Map.of("nome", "Negócio " + slug, "slug", slug, "whatsapp", "00900000000"));
        MvcResult resultado = mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(corpo)))
            .andExpect(status().isCreated())
            .andReturn();
        return resultado.getResponse().getCookie(CookieDeSessao.NOME);
    }

    /** Cadastra um serviço e devolve o id. */
    protected long criarServico(Cookie sessao, String nome, int duracao) throws Exception {
        MvcResult resultado = mvc.perform(post("/api/servicos").cookie(sessao).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("nome", nome, "duracaoMinutos", duracao))))
            .andExpect(status().isCreated())
            .andReturn();
        return lerJson(resultado).get("id").asLong();
    }

    /** Deixa o negócio aberto de segunda a sábado, das 09:00 às 12:00, sem almoço. */
    protected void abrirDasNoveAoMeioDia(Cookie sessao) throws Exception {
        StringBuilder dias = new StringBuilder("{\"dias\":[");
        for (int dia = 1; dia <= 7; dia++) {
            dias.append(dia == 7
                ? "{\"diaSemana\":7,\"aberto\":false}"
                : "{\"diaSemana\":" + dia + ",\"aberto\":true,\"abre\":\"09:00\",\"fecha\":\"12:00\"},");
        }
        dias.append("]}");
        mvc.perform(put("/api/horarios").cookie(sessao).contentType(MediaType.APPLICATION_JSON).content(dias.toString()))
            .andExpect(status().isOk());
    }

    protected String pedidoDeAgendamento(long servicoId, String data, String horario) throws Exception {
        return json.writeValueAsString(Map.of(
            "servicoId", servicoId,
            "data", data,
            "horario", horario,
            "clienteNome", "Cliente de exemplo",
            "clienteWhatsapp", "(11) 90000-0000"));
    }

    protected JsonNode lerJson(MvcResult resultado) throws Exception {
        return json.readTree(resultado.getResponse().getContentAsString());
    }
}
