package com.agendafacil.agendamento;

import java.util.List;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.ServicoResponse;

/** O que a página pública mostra do negócio: dados de contato e serviços ativos. */
public record NegocioPublicoResponse(String nome, String slug, String whatsapp, String endereco,
        List<ServicoResponse> servicos) {

    public static NegocioPublicoResponse de(Negocio negocio, List<ServicoResponse> servicos) {
        return new NegocioPublicoResponse(negocio.getNome(), negocio.getSlug(), negocio.getWhatsapp(),
            negocio.getEndereco(), servicos);
    }
}
