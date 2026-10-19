package com.agendafacil.erro;

/** E-mail ou senha errados (401). A mensagem não diz qual dos dois, de propósito. */
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException() {
        super("E-mail ou senha incorretos.");
    }
}
