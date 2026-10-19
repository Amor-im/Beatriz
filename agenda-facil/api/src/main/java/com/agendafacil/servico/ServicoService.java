package com.agendafacil.servico;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.agendamento.AgendamentoRepository;
import com.agendafacil.erro.ConflitoException;
import com.agendafacil.erro.NaoEncontradoException;
import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;

@Service
public class ServicoService {

    private final ServicoRepository servicos;
    private final AgendamentoRepository agendamentos;
    private final NegocioService negocios;

    public ServicoService(ServicoRepository servicos, AgendamentoRepository agendamentos, NegocioService negocios) {
        this.servicos = servicos;
        this.agendamentos = agendamentos;
        this.negocios = negocios;
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listar(Long donoId) {
        Negocio negocio = negocios.doDono(donoId);
        return servicos.findByNegocioIdOrderByNomeAsc(negocio.getId()).stream().map(ServicoResponse::de).toList();
    }

    @Transactional
    public ServicoResponse criar(Long donoId, ServicoRequest dados) {
        validarDuracao(dados.duracaoMinutos());
        Negocio negocio = negocios.doDono(donoId);
        Servico servico = new Servico(negocio, dados.nome(), dados.duracaoMinutos(), dados.precoCentavos(), dados.ativo());
        return ServicoResponse.de(servicos.save(servico));
    }

    @Transactional
    public ServicoResponse atualizar(Long donoId, Long id, ServicoRequest dados) {
        validarDuracao(dados.duracaoMinutos());
        Servico servico = doDono(donoId, id);
        servico.atualizar(dados.nome(), dados.duracaoMinutos(), dados.precoCentavos(), dados.ativo());
        return ServicoResponse.de(servico);
    }

    @Transactional
    public void excluir(Long donoId, Long id) {
        Servico servico = doDono(donoId, id);
        if (agendamentos.existsByServicoId(servico.getId())) {
            // apagar perderia o histórico da agenda; desativar tira da página pública e mantém tudo
            throw new ConflitoException("Esse serviço já tem agendamentos. Desative em vez de excluir.");
        }
        servicos.delete(servico);
    }

    /** Serviço ativo de um negócio, para a página pública. */
    @Transactional(readOnly = true)
    public Servico ativoDoNegocio(Long negocioId, Long servicoId) {
        return servicos.findByIdAndNegocioId(servicoId, negocioId)
            .filter(Servico::isAtivo)
            .orElseThrow(() -> new NaoEncontradoException("Esse serviço não está disponível."));
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> ativos(Long negocioId) {
        return servicos.findByNegocioIdAndAtivoTrueOrderByNomeAsc(negocioId).stream().map(ServicoResponse::de).toList();
    }

    private Servico doDono(Long donoId, Long id) {
        Negocio negocio = negocios.doDono(donoId);
        // serviço de outro negócio responde 404, igual a um que não existe
        return servicos.findByIdAndNegocioId(id, negocio.getId())
            .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado."));
    }

    private static void validarDuracao(int minutos) {
        if (minutos % 5 != 0) {
            throw new RegraDeNegocioException("Use uma duração em múltiplos de 5 minutos (30, 45, 60...).");
        }
    }
}
