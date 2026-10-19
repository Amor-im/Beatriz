package com.agendafacil.negocio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.erro.ConflitoException;
import com.agendafacil.erro.NaoEncontradoException;

@Service
public class NegocioService {

    private final NegocioRepository negocios;

    public NegocioService(NegocioRepository negocios) {
        this.negocios = negocios;
    }

    /**
     * O negócio de quem está logado. Todas as operações do painel começam aqui:
     * o dono só alcança os dados do próprio negócio, porque a busca já parte do id dele.
     */
    @Transactional(readOnly = true)
    public Negocio doDono(Long donoId) {
        return negocios.findByDonoId(donoId)
            .orElseThrow(() -> new NaoEncontradoException("Negócio não encontrado."));
    }

    @Transactional(readOnly = true)
    public Negocio porSlug(String slug) {
        return negocios.findBySlug(slug)
            .orElseThrow(() -> new NaoEncontradoException("Não encontramos esse negócio. Confira o link."));
    }

    @Transactional
    public NegocioResponse atualizar(Long donoId, NegocioRequest dados) {
        Negocio negocio = doDono(donoId);
        Slugs.validarNaoReservado(dados.slug());
        if (negocios.existsBySlugAndIdNot(dados.slug(), negocio.getId())) {
            throw new ConflitoException("Esse endereço já está em uso. Escolha outro.");
        }
        negocio.atualizar(dados.nome(), dados.slug(), dados.whatsapp(), dados.endereco());
        return NegocioResponse.de(negocio);
    }
}
