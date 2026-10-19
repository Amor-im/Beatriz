package com.agendafacil.erro;

/** O pedido está bem formado, mas quebra uma regra do produto (422). */
public class RegraDeNegocioException extends RuntimeException {

    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
