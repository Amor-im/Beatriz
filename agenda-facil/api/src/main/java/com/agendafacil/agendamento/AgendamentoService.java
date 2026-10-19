package com.agendafacil.agendamento;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.erro.ConflitoException;
import com.agendafacil.erro.MuitasTentativasException;
import com.agendafacil.erro.NaoEncontradoException;
import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;
import com.agendafacil.seguranca.LimitadorDeTentativas;
import com.agendafacil.servico.Servico;
import com.agendafacil.servico.ServicoService;

/** Agendamento feito pelo cliente na página pública. */
@Service
public class AgendamentoService {

    private static final Logger log = LoggerFactory.getLogger(AgendamentoService.class);

    // Até 10 tentativas de agendamento a cada 10 minutos vindas do mesmo IP.
    static final int MAX_AGENDAMENTOS_POR_IP = 10;
    static final Duration JANELA_AGENDAMENTO = Duration.ofMinutes(10);

    /** Nome da regra do banco que impede dois agendamentos no mesmo horário (V1__esquema_inicial.sql). */
    static final String REGRA_SEM_SOBREPOSICAO = "agendamento_sem_sobreposicao";

    static final String MENSAGEM_OCUPADO = "Esse horário acabou de ser reservado por outra pessoa. Escolha um destes:";

    private final AgendamentoRepository agendamentos;
    private final NegocioService negocios;
    private final ServicoService servicos;
    private final DisponibilidadeService disponibilidade;
    private final LimitadorDeTentativas limitador;
    private final Clock relogio;

    public AgendamentoService(AgendamentoRepository agendamentos, NegocioService negocios, ServicoService servicos,
            DisponibilidadeService disponibilidade, LimitadorDeTentativas limitador, Clock relogio) {
        this.agendamentos = agendamentos;
        this.negocios = negocios;
        this.servicos = servicos;
        this.disponibilidade = disponibilidade;
        this.limitador = limitador;
        this.relogio = relogio;
    }

    /**
     * Marca um horário. A checagem acontece duas vezes:
     * 1) aqui, antes de gravar: o horário precisa estar na lista de livres calculada pelo servidor;
     * 2) no banco, na gravação: a regra agendamento_sem_sobreposicao recusa sobreposição mesmo
     *    quando duas pessoas confirmam no mesmo instante e as duas passaram pela checagem 1.
     *
     * Sem @Transactional de propósito: a gravação roda na transação do próprio repositório,
     * então, se o banco recusar, a exceção chega aqui e vira uma resposta 409 com sugestões.
     */
    public AgendamentoPublicoResponse agendar(String slug, NovoAgendamentoRequest dados, String ip) {
        String chave = "agendar:" + ip;
        if (limitador.excedeu(chave, MAX_AGENDAMENTOS_POR_IP, JANELA_AGENDAMENTO)) {
            throw new MuitasTentativasException("Muitas tentativas de agendamento. Espere alguns minutos e tente de novo.",
                JANELA_AGENDAMENTO);
        }
        limitador.registrar(chave, JANELA_AGENDAMENTO);

        Negocio negocio = negocios.porSlug(slug);
        Servico servico = servicos.ativoDoNegocio(negocio.getId(), dados.servicoId());
        ZoneId zona = negocio.zona();
        Instant inicio = dados.data().atTime(dados.horario()).atZone(zona).toInstant();
        Instant fim = inicio.plusSeconds(servico.getDuracaoMinutos() * 60L);

        if (!inicio.isAfter(relogio.instant())) {
            throw new RegraDeNegocioException("Esse horário já passou. Escolha outro.");
        }
        if (!disponibilidade.dentroDaJanela(negocio, dados.data())) {
            throw new RegraDeNegocioException(
                "Dá para agendar nos próximos " + DisponibilidadeService.DIAS_A_FRENTE + " dias. Escolha outra data.");
        }
        if (!disponibilidade.horariosLivres(negocio, servico, dados.data()).contains(dados.horario())) {
            if (!disponibilidade.existeNaGrade(negocio, servico, dados.data(), dados.horario())) {
                throw new RegraDeNegocioException("Esse horário está fora do atendimento. Escolha um dos horários da lista.");
            }
            throw horarioOcupado(negocio, servico, dados);
        }

        Agendamento novo = new Agendamento(negocio, servico, dados.clienteNome(), dados.clienteWhatsapp(), inicio, fim);
        try {
            agendamentos.saveAndFlush(novo);
        } catch (DataIntegrityViolationException corrida) {
            if (!String.valueOf(corrida.getMostSpecificCause().getMessage()).contains(REGRA_SEM_SOBREPOSICAO)) {
                throw corrida; // outra regra do banco: não é horário ocupado
            }
            log.info("Agendamento simultâneo recusado pelo banco no negócio {}", negocio.getSlug());
            throw horarioOcupado(negocio, servico, dados);
        }
        return AgendamentoPublicoResponse.de(novo, negocio, servico);
    }

    @Transactional(readOnly = true)
    public AgendamentoPublicoResponse porCodigo(UUID codigo) {
        Agendamento agendamento = buscarPorCodigo(codigo);
        return AgendamentoPublicoResponse.de(agendamento, agendamento.getNegocio(), agendamento.getServico());
    }

    @Transactional(readOnly = true)
    public String calendario(UUID codigo) {
        Agendamento agendamento = buscarPorCodigo(codigo);
        return IcsGerador.gerar(agendamento, agendamento.getNegocio(), agendamento.getServico(), relogio.instant());
    }

    private Agendamento buscarPorCodigo(UUID codigo) {
        return agendamentos.porCodigo(codigo)
            .orElseThrow(() -> new NaoEncontradoException("Agendamento não encontrado. Confira o link."));
    }

    private ConflitoException horarioOcupado(Negocio negocio, Servico servico, NovoAgendamentoRequest dados) {
        LocalDate dia = dados.data();
        List<HorarioSugerido> sugestoes = disponibilidade.sugestoes(negocio, servico, dia, dados.horario());
        String mensagem = sugestoes.isEmpty()
            ? "Esse horário acabou de ser reservado por outra pessoa e não há outros livres nos próximos dias."
            : MENSAGEM_OCUPADO;
        return ConflitoException.deHorario(mensagem, sugestoes);
    }
}
