package com.agendafacil.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EntrarRequest(
    @NotBlank(message = "Informe seu e-mail.")
    @Size(max = 120, message = "O e-mail pode ter até 120 caracteres.")
    String email,

    @NotBlank(message = "Informe sua senha.")
    @Size(max = 72, message = "A senha pode ter até 72 caracteres.")
    String senha
) {
    public EntrarRequest {
        email = email == null ? null : email.trim().toLowerCase();
    }
}
