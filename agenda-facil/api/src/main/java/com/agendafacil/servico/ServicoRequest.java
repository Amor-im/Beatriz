package com.agendafacil.servico;

import com.agendafacil.seguranca.Textos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ServicoRequest(
    @NotBlank(message = "Informe o nome do serviço.")
    @Size(min = 2, max = 60, message = "O nome precisa ter entre 2 e 60 caracteres.")
    String nome,

    @NotNull(message = "Informe a duração.")
    @Min(value = 5, message = "A duração mínima é 5 minutos.")
    @Max(value = 480, message = "A duração máxima é 8 horas.")
    Integer duracaoMinutos,

    @Min(value = 0, message = "O preço não pode ser negativo.")
    @Max(value = 10_000_000, message = "Confira o preço.")
    Integer precoCentavos,

    Boolean ativo
) {
    public ServicoRequest {
        nome = Textos.limpar(nome);
        ativo = ativo == null ? Boolean.TRUE : ativo;
    }
}
