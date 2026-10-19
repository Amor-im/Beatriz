package com.agendafacil.negocio;

import com.agendafacil.seguranca.Textos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dados do perfil do negócio, vindos do formulário. O construtor compacto limpa antes de validar. */
public record NegocioRequest(
    @NotBlank(message = "Informe o nome do negócio.")
    @Size(min = 2, max = 80, message = "O nome precisa ter entre 2 e 80 caracteres.")
    String nome,

    @NotBlank(message = "Escolha o endereço do seu link.")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Use só letras minúsculas, números e hífen.")
    @Size(min = 3, max = 40, message = "O endereço precisa ter entre 3 e 40 caracteres.")
    String slug,

    @NotBlank(message = "Informe o WhatsApp do negócio.")
    @Pattern(regexp = "^\\d{10,11}$", message = "Informe o WhatsApp com DDD, por exemplo (11) 98765-4321.")
    String whatsapp,

    @Size(max = 160, message = "O endereço pode ter até 160 caracteres.")
    String endereco
) {
    public NegocioRequest {
        nome = Textos.limpar(nome);
        slug = slug == null ? null : slug.trim().toLowerCase();
        whatsapp = Textos.soDigitos(whatsapp);
        endereco = Textos.limpar(endereco);
    }
}
