package com.agendafacil.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;

import com.agendafacil.seguranca.Textos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** O que o cliente envia na página pública. Horário no formato "10:20". */
public record NovoAgendamentoRequest(
    @NotNull(message = "Escolha um serviço.")
    Long servicoId,

    @NotNull(message = "Escolha o dia.")
    LocalDate data,

    @NotNull(message = "Escolha o horário.")
    LocalTime horario,

    @NotBlank(message = "Informe seu nome.")
    @Size(min = 2, max = 80, message = "O nome precisa ter entre 2 e 80 caracteres.")
    String clienteNome,

    @NotBlank(message = "Informe seu WhatsApp.")
    @Pattern(regexp = "^\\d{10,11}$", message = "Informe o WhatsApp com DDD, por exemplo (11) 98765-4321.")
    String clienteWhatsapp
) {
    public NovoAgendamentoRequest {
        clienteNome = Textos.limpar(clienteNome);
        clienteWhatsapp = Textos.soDigitos(clienteWhatsapp);
    }
}
