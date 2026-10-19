package com.agendafacil.bloqueio;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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
public class BloqueioService {

    private final BloqueioRepository bloqueios;
    private final AgendamentoRepository agendamentos;
    private final NegocioService negocios;
    private final Clock relogio;

    public BloqueioService(BloqueioRepository bloqueios, AgendamentoRepository agendamentos,
            NegocioService negocios, Clock relogio) {
        this.bloqueios = bloqueios;
        this.agendamentos = agendamentos;
        this.negocios = negocios;
        this.relogio = relogio;
    }

    /** Sem datas: de hoje (no fuso do negócio) até 60 dias para frente. */
    @Transactional(readOnly = true)
    public List<BloqueioResponse> listar(Long donoId, LocalDate de, LocalDate ate) {
        Negocio negocio = negocios.doDono(donoId);
        LocalDate inicio = de != null ? de : LocalDate.now(relogio.withZone(negocio.zona()));
        LocalDate fim = ate != null ? ate : inicio.plusDays(60);
        if (fim.isBefore(inicio) || fim.isAfter(inicio.plusDays(366))) {
            throw new RegraDeNegocioException("Escolha um período de até um ano.");
        }
        return entre(negocio, inicio, fim);
    }

    /** Também usado pela agenda do painel, que mostra agendamentos e bloqueios juntos. */
    @Transactional(readOnly = true)
    public List<BloqueioResponse> entre(Negocio negocio, LocalDate de, LocalDate ate) {
        ZoneId zona = negocio.zona();
        Instant inicio = de.atStartOfDay(zona).toInstant();
        Instant fim = ate.plusDays(1).atStartOfDay(zona).toInstant();
        return bloqueios.entre(negocio.getId(), inicio, fim).stream()
            .map(b -> BloqueioResponse.de(b, zona))
            .toList();
    }

    @Transactional
    public BloqueioResponse criar(Long donoId, BloqueioRequest dados) {
        Negocio negocio = negocios.doDono(donoId);
        ZoneId zona = negocio.zona();

        Instant inicio;
        Instant fim;
        if (dados.diaInteiro()) {
            inicio = dados.data().atStartOfDay(zona).toInstant();
            fim = dados.data().plusDays(1).atStartOfDay(zona).toInstant();
        } else {
            if (dados.inicio() == null || dados.fim() == null) {
                throw new RegraDeNegocioException("Informe o horário de início e de fim, ou marque o dia inteiro.");
            }
            if (!dados.fim().isAfter(dados.inicio())) {
                throw new RegraDeNegocioException("O fim do bloqueio precisa ser depois do início.");
            }
            inicio = dados.data().atTime(dados.inicio()).atZone(zona).toInstant();
            fim = dados.data().atTime(dados.fim()).atZone(zona).toInstant();
        }
        if (!fim.isAfter(relogio.instant())) {
            throw new RegraDeNegocioException("Esse horário já passou.");
        }
        int marcados = agendamentos.ativosEntre(negocio.getId(), inicio, fim).size();
        if (marcados > 0) {
            // bloquear por cima esconderia um cliente que já conta com o horário
            throw new ConflitoException(marcados == 1
                ? "Já tem 1 agendamento nesse período. Cancele ou combine outro horário com o cliente antes de bloquear."
                : "Já tem " + marcados + " agendamentos nesse período. Cancele ou combine outro horário com os clientes antes de bloquear.");
        }
        Bloqueio bloqueio = bloqueios.save(new Bloqueio(negocio, inicio, fim, dados.motivo()));
        return BloqueioResponse.de(bloqueio, zona);
    }

    @Transactional
    public void excluir(Long donoId, Long id) {
        Negocio negocio = negocios.doDono(donoId);
        Bloqueio bloqueio = bloqueios.findByIdAndNegocioId(id, negocio.getId())
            .orElseThrow(() -> new NaoEncontradoException("Bloqueio não encontrado."));
        bloqueios.delete(bloqueio);
    }
}
