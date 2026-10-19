package com.agendafacil.erro;

import java.util.List;
import java.util.Map;

/**
 * Conflito com o que já existe (409): e-mail já cadastrado, horário já ocupado...
 * "extras" vai junto na resposta, por exemplo os horários livres mais próximos.
 */
public class ConflitoException extends RuntimeException {

    private final transient Map<String, Object> extras;

    public ConflitoException(String mensagem) {
        this(mensagem, Map.of());
    }

    public ConflitoException(String mensagem, Map<String, Object> extras) {
        super(mensagem);
        this.extras = extras;
    }

    public static ConflitoException deHorario(String mensagem, List<?> horariosProximos) {
        return new ConflitoException(mensagem, Map.of("horariosProximos", horariosProximos));
    }

    public Map<String, Object> getExtras() {
        return extras;
    }
}
