package com.agendafacil.integracao;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import jakarta.servlet.http.Cookie;

/** O painel do dono: agenda, confirmar, cancelar, bloquear e a regra de que cada um só vê o que é seu. */
class PainelIntegracaoTest extends TesteDeIntegracao {

    private static final String TERCA = "2030-03-05";

    private Cookie ana;
    private long corte;

    @BeforeEach
    void prepararNegocio() throws Exception {
        ana = criarConta("ana@example.com", "studio-ana");
        abrirDasNoveAoMeioDia(ana);
        corte = criarServico(ana, "Corte", 60);
    }

    @Test
    void agendaDoDiaMostraOAgendamentoEDaParaConfirmar() throws Exception {
        long id = agendarComoCliente("10:00");

        mvc.perform(get("/api/agenda").cookie(ana).param("de", TERCA).param("ate", TERCA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.agendamentos[0].clienteNome").value("Cliente de exemplo"))
            .andExpect(jsonPath("$.agendamentos[0].clienteWhatsapp").value("11900000000"));
        mvc.perform(patch("/api/agenda/" + id + "/confirmar").cookie(ana))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMADO"));
        mvc.perform(get("/api/agenda/resumo").cookie(ana))
            .andExpect(jsonPath("$.agendados").value(1))
            .andExpect(jsonPath("$.confirmados").value(1))
            .andExpect(jsonPath("$.semanaInicio").value("2030-03-04"));
    }

    @Test
    void cancelarLiberaOHorarioDeNovo() throws Exception {
        long id = agendarComoCliente("10:00");

        mvc.perform(patch("/api/agenda/" + id + "/cancelar").cookie(ana)).andExpect(status().isOk());

        horariosDeTerca().andExpect(jsonPath("$.horarios").value(contains("09:00", "10:00", "11:00")));
        mvc.perform(patch("/api/agenda/" + id + "/confirmar").cookie(ana)).andExpect(status().isUnprocessableEntity());
    }

    @Test
    void outroDonoNaoAlcancaOsDadosDaAna() throws Exception {
        long id = agendarComoCliente("10:00");
        Cookie bia = criarConta("bia@example.com", "studio-bia");

        mvc.perform(patch("/api/agenda/" + id + "/cancelar").cookie(bia)).andExpect(status().isNotFound());
        mvc.perform(put("/api/servicos/" + corte).cookie(bia).contentType(MediaType.APPLICATION_JSON)
            .content("{\"nome\":\"Invadido\",\"duracaoMinutos\":30}")).andExpect(status().isNotFound());
        mvc.perform(delete("/api/servicos/" + corte).cookie(bia)).andExpect(status().isNotFound());
        mvc.perform(get("/api/agenda").cookie(bia).param("de", TERCA).param("ate", TERCA))
            .andExpect(jsonPath("$.agendamentos.length()").value(0));
    }

    @Test
    void bloqueioTiraOsHorariosDaPaginaPublica() throws Exception {
        mvc.perform(post("/api/bloqueios").cookie(ana).contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":\"" + TERCA + "\",\"inicio\":\"09:00\",\"fim\":\"11:00\",\"motivo\":\"Consulta médica\"}"))
            .andExpect(status().isCreated());

        horariosDeTerca().andExpect(jsonPath("$.horarios").value(contains("11:00")));
    }

    @Test
    void naoDaParaBloquearPorCimaDeUmCliente() throws Exception {
        agendarComoCliente("10:00");

        mvc.perform(post("/api/bloqueios").cookie(ana).contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":\"" + TERCA + "\",\"diaInteiro\":true}"))
            .andExpect(status().isConflict());
    }

    @Test
    void servicoComAgendamentoNaoPodeSerExcluido() throws Exception {
        agendarComoCliente("10:00");

        mvc.perform(delete("/api/servicos/" + corte).cookie(ana)).andExpect(status().isConflict());
    }

    @Test
    void horarioDeFuncionamentoInvalidoERecusado() throws Exception {
        String almocoForaDoExpediente = "{\"dias\":[" +
            "{\"diaSemana\":1,\"aberto\":true,\"abre\":\"09:00\",\"fecha\":\"12:00\",\"almocoInicio\":\"13:00\",\"almocoFim\":\"14:00\"}," +
            "{\"diaSemana\":2,\"aberto\":false},{\"diaSemana\":3,\"aberto\":false},{\"diaSemana\":4,\"aberto\":false}," +
            "{\"diaSemana\":5,\"aberto\":false},{\"diaSemana\":6,\"aberto\":false},{\"diaSemana\":7,\"aberto\":false}]}";

        mvc.perform(put("/api/horarios").cookie(ana).contentType(MediaType.APPLICATION_JSON).content(almocoForaDoExpediente))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Em segunda-feira, o almoço precisa ficar dentro do horário de atendimento."));
    }

    private long agendarComoCliente(String horario) throws Exception {
        mvc.perform(post("/api/publico/negocios/studio-ana/agendamentos").contentType(MediaType.APPLICATION_JSON)
                .content(pedidoDeAgendamento(corte, TERCA, horario)))
            .andExpect(status().isCreated());
        return lerJson(mvc.perform(get("/api/agenda").cookie(ana).param("de", TERCA).param("ate", TERCA)).andReturn())
            .get("agendamentos").get(0).get("id").asLong();
    }

    private org.springframework.test.web.servlet.ResultActions horariosDeTerca() throws Exception {
        return mvc.perform(get("/api/publico/negocios/studio-ana/horarios")
            .param("servicoId", String.valueOf(corte)).param("data", TERCA));
    }
}
