package com.agendafacil.negocio;

public record NegocioResponse(Long id, String nome, String slug, String whatsapp, String endereco) {

    public static NegocioResponse de(Negocio negocio) {
        return new NegocioResponse(negocio.getId(), negocio.getNome(), negocio.getSlug(),
            negocio.getWhatsapp(), negocio.getEndereco());
    }
}
