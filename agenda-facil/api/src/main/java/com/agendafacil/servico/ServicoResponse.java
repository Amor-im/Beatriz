package com.agendafacil.servico;

public record ServicoResponse(Long id, String nome, int duracaoMinutos, Integer precoCentavos, boolean ativo) {

    public static ServicoResponse de(Servico servico) {
        return new ServicoResponse(servico.getId(), servico.getNome(), servico.getDuracaoMinutos(),
            servico.getPrecoCentavos(), servico.isAtivo());
    }
}
