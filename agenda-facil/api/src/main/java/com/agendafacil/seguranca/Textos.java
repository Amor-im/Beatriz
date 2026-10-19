package com.agendafacil.seguranca;

/**
 * Limpeza dos textos que chegam do usuário, antes de validar e gravar:
 * tira espaços sobrando e caracteres de controle. O front mostra tudo como texto
 * (o React escapa HTML), então não é preciso "traduzir" tags aqui.
 */
public final class Textos {

    private Textos() {
    }

    public static String limpar(String texto) {
        if (texto == null) {
            return null;
        }
        String limpo = texto.replaceAll("\\p{Cntrl}", " ").replaceAll("\\s+", " ").trim();
        return limpo.isEmpty() ? null : limpo;
    }

    /** "(11) 98765-4321" vira "11987654321". */
    public static String soDigitos(String texto) {
        return texto == null ? null : texto.replaceAll("\\D", "");
    }
}
