package com.agendafacil.integracao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import com.agendafacil.agendamento.Agendamento;
import com.agendafacil.agendamento.AgendamentoRepository;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioRepository;
import com.agendafacil.servico.Servico;
import com.agendafacil.servico.ServicoRepository;

import jakarta.servlet.http.Cookie;

/** O fluxo do cliente na página pública e as regras que impedem dois clientes no mesmo horário. */
class AgendamentoIntegracaoTest extends TesteDeIntegracao {

    private static final String TERCA = "2030-03-05";

    @Autowired
    private AgendamentoRepository agendamentos;
    @Autowired
    private NegocioRepository negocios;
    @Autowired
    private ServicoRepository servicos;

    private Cookie sessao;
    private long corte;

    @BeforeEach
    void prepararNegocio() throws Exception {
        sessao = criarConta("ana@example.com", "studio-ana");
        abrirDasNoveAoMeioDia(sessao);
        corte = criarServico(sessao, "Corte", 60);
    }

    @Test
    void clienteVeOsServicosOsDiasEOsHorariosLivres() throws Exception {
        long inativo = criarServico(sessao, "Coloração", 120);
        mvc.perform(put("/api/servicos/" + inativo).cookie(sessao).contentType(MediaType.APPLICATION_JSON)
            .content("{\"nome\":\"Coloração\",\"duracaoMinutos\":120,\"ativo\":false}")).andExpect(status().isOk());

        mvc.perform(get("/api/publico/negocios/studio-ana"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.servicos.length()").value(1))
            .andExpect(jsonPath("$.servicos[0].nome").value("Corte"));
        mvc.perform(get("/api/publico/negocios/studio-ana/dias").param("servicoId", String.valueOf(corte)))
            .andExpect(jsonPath("$.length()").value(14))
            .andExpect(jsonPath("$[0].situacao").value("LIVRE"))
            .andExpect(jsonPath("$[6].situacao").value("FECHADO")); // domingo
        horariosDeTerca().andExpect(jsonPath("$.horarios").value(org.hamcrest.Matchers.contains("09:00", "10:00", "11:00")));
    }

    @Test
    void agendaEOHorarioSomeDaLista() throws Exception {
        MvcResult resultado = agendar(TERCA, "10:00")
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("A_CONFIRMAR"))
            .andExpect(jsonPath("$.inicio").value("10:00"))
            .andExpect(jsonPath("$.fim").value("11:00"))
            .andReturn();

        horariosDeTerca().andExpect(jsonPath("$.horarios").value(org.hamcrest.Matchers.contains("09:00", "11:00")));

        String codigo = lerJson(resultado).get("codigo").asText();
        mvc.perform(get("/api/publico/agendamentos/" + codigo))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.servicoNome").value("Corte"))
            .andExpect(jsonPath("$.clienteWhatsapp").doesNotExist());
        mvc.perform(get("/api/publico/agendamentos/" + codigo + "/calendario.ics"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("text/calendar"))
            .andExpect(content().string(containsString("BEGIN:VEVENT")))
            .andExpect(content().string(containsString("DTSTART:20300305T130000Z")));
    }

    @Test
    void segundoClienteNoMesmoHorarioRecebeConflitoComSugestoes() throws Exception {
        agendar(TERCA, "10:00").andExpect(status().isCreated());

        agendar(TERCA, "10:00")
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value(containsString("acabou de ser reservado")))
            .andExpect(jsonPath("$.horariosProximos[0].data").value(TERCA))
            .andExpect(jsonPath("$.horariosProximos[*].horario").value(org.hamcrest.Matchers.hasItems("09:00", "11:00")));
    }

    @Test
    void duasPessoasConfirmandoAoMesmoTempoSoUmaConsegue() throws Exception {
        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<Integer>> respostas = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            String ip = "10.0.0." + i;
            Callable<Integer> tentativa = () -> {
                largada.await();
                return mvc.perform(post("/api/publico/negocios/studio-ana/agendamentos")
                        .with(requisicao -> { requisicao.setRemoteAddr(ip); return requisicao; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pedidoDeAgendamento(corte, TERCA, "10:00")))
                    .andReturn().getResponse().getStatus();
            };
            respostas.add(pool.submit(tentativa));
        }
        largada.countDown();
        List<Integer> status = new ArrayList<>();
        for (Future<Integer> resposta : respostas) {
            status.add(resposta.get());
        }
        pool.shutdown();

        assertThat(status).containsExactlyInAnyOrder(201, 409);
        assertThat(agendamentos.count()).isEqualTo(1);
    }

    @Test
    void oProprioBancoRecusaHorariosQueSeSobrepoem() {
        // mesmo que alguém pule a checagem do serviço e grave direto no repositório
        Negocio negocio = negocios.findBySlug("studio-ana").orElseThrow();
        Servico servico = servicos.findById(corte).orElseThrow();
        Instant dezHoras = Instant.parse("2030-03-05T13:00:00Z");
        agendamentos.saveAndFlush(new Agendamento(negocio, servico, "Cliente A", "00900000000",
            dezHoras, dezHoras.plusSeconds(3600)));

        Instant dezEMeia = dezHoras.plusSeconds(1800);
        assertThatThrownBy(() -> agendamentos.saveAndFlush(new Agendamento(negocio, servico, "Cliente B", "00900000000",
            dezEMeia, dezEMeia.plusSeconds(3600))))
            .isInstanceOf(DataIntegrityViolationException.class)
            .hasMessageContaining("agendamento_sem_sobreposicao");
    }

    @Test
    void horarioForaDoAtendimentoOuQueJaPassouERecusado() throws Exception {
        agendar(TERCA, "15:00").andExpect(status().isUnprocessableEntity());
        agendar(TERCA, "09:30").andExpect(status().isUnprocessableEntity()); // fora da grade de 60 min
        agendar("2030-03-04", "07:00").andExpect(status().isUnprocessableEntity());
        agendar("2030-03-10", "10:00").andExpect(status().isUnprocessableEntity()); // domingo, fechado
    }

    @Test
    void dadosDoClienteSaoValidadosNoServidor() throws Exception {
        String semWhatsapp = json.writeValueAsString(Map.of("servicoId", corte, "data", TERCA, "horario", "10:00",
            "clienteNome", "Cliente", "clienteWhatsapp", "123"));

        mvc.perform(post("/api/publico/negocios/studio-ana/agendamentos").contentType(MediaType.APPLICATION_JSON)
                .content(semWhatsapp))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.erros.clienteWhatsapp").exists());
    }

    @Test
    void negocioInexistenteResponde404() throws Exception {
        mvc.perform(get("/api/publico/negocios/nao-existe")).andExpect(status().isNotFound());
    }

    private ResultActions agendar(String data, String horario) throws Exception {
        return mvc.perform(post("/api/publico/negocios/studio-ana/agendamentos").contentType(MediaType.APPLICATION_JSON)
            .content(pedidoDeAgendamento(corte, data, horario)));
    }

    private ResultActions horariosDeTerca() throws Exception {
        return mvc.perform(get("/api/publico/negocios/studio-ana/horarios")
            .param("servicoId", String.valueOf(corte)).param("data", TERCA));
    }
}
