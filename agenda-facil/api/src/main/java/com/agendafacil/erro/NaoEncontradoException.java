package com.agendafacil.erro;

/** O recurso não existe, ou não pertence a quem está pedindo (404). */
public class NaoEncontradoException extends RuntimeException {

    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
