package com.agendafacil.auth;

import com.agendafacil.negocio.NegocioRequest;
import com.agendafacil.seguranca.Textos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Criar conta: dados de quem cuida da agenda + dados do negócio, num passo só. */
public record CadastroRequest(
    @NotBlank(message = "Informe seu nome.")
    @Size(min = 2, max = 80, message = "O nome precisa ter entre 2 e 80 caracteres.")
    String nome,

    @NotBlank(message = "Informe seu e-mail.")
    @Email(message = "Confira o e-mail, parece que falta alguma parte.")
    @Size(max = 120, message = "O e-mail pode ter até 120 caracteres.")
    String email,

    @NotBlank(message = "Crie uma senha.")
    @Size(min = 12, max = 72, message = "A senha precisa ter entre 12 e 72 caracteres.")
    String senha,

    @NotNull(message = "Informe os dados do negócio.")
    @Valid
    NegocioRequest negocio
) {
    public CadastroRequest {
        nome = Textos.limpar(nome);
        email = email == null ? null : email.trim().toLowerCase();
        // a senha não é alterada: espaços também contam
    }
}
