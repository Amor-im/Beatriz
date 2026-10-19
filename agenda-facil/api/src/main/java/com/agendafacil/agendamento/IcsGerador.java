package com.agendafacil.agendamento;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;

/**
 * Gera o arquivo .ics ("adicionar à agenda") no formato iCalendar (RFC 5545),
 * que Google Agenda, Apple Calendário e Outlook abrem.
 * Regras do formato que importam aqui: linhas terminam em CRLF, linhas longas são dobradas
 * em 75 bytes e vírgula, ponto e vírgula, barra e quebra de linha precisam de escape.
 */
public final class IcsGerador {

    private static final DateTimeFormatter UTC = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'")
        .withZone(ZoneOffset.UTC);

    private IcsGerador() {
    }

    public static String gerar(Agendamento agendamento, Negocio negocio, Servico servico, Instant agora) {
        StringBuilder ics = new StringBuilder();
        linha(ics, "BEGIN:VCALENDAR");
        linha(ics, "VERSION:2.0");
        linha(ics, "PRODID:-//Agenda Facil//Agendamento//PT-BR");
        linha(ics, "CALSCALE:GREGORIAN");
        linha(ics, "METHOD:PUBLISH");
        linha(ics, "BEGIN:VEVENT");
        linha(ics, "UID:" + agendamento.getCodigo() + "@agenda-facil");
        linha(ics, "DTSTAMP:" + UTC.format(agora));
        linha(ics, "DTSTART:" + UTC.format(agendamento.getInicio()));
        linha(ics, "DTEND:" + UTC.format(agendamento.getFim()));
        linha(ics, "STATUS:" + statusDoCalendario(agendamento.getStatus()));
        linha(ics, "SUMMARY:" + escapar(servico.getNome() + " · " + negocio.getNome()));
        if (negocio.getEndereco() != null) {
            linha(ics, "LOCATION:" + escapar(negocio.getEndereco()));
        }
        linha(ics, "DESCRIPTION:" + escapar("Agendado pelo Agenda Fácil.\nPara remarcar ou cancelar, fale com "
            + negocio.getNome() + " pelo WhatsApp."));
        linha(ics, "BEGIN:VALARM");
        linha(ics, "ACTION:DISPLAY");
        linha(ics, "DESCRIPTION:" + escapar(servico.getNome() + " em 1 hora"));
        linha(ics, "TRIGGER:-PT1H");
        linha(ics, "END:VALARM");
        linha(ics, "END:VEVENT");
        linha(ics, "END:VCALENDAR");
        return ics.toString();
    }

    /** Cancelado vira CANCELLED: quem já salvou o evento vê que ele foi cancelado ao abrir o arquivo de novo. */
    static String statusDoCalendario(StatusAgendamento status) {
        return switch (status) {
            case CONFIRMADO -> "CONFIRMED";
            case A_CONFIRMAR -> "TENTATIVE";
            case CANCELADO -> "CANCELLED";
        };
    }

    static String escapar(String texto) {
        return texto.replace("\\", "\\\\")
            .replace(";", "\\;")
            .replace(",", "\\,")
            .replace("\r\n", "\\n")
            .replace("\n", "\\n");
    }

    /** Dobra linhas com mais de 75 bytes: a continuação começa com um espaço. */
    private static void linha(StringBuilder ics, String conteudo) {
        StringBuilder atual = new StringBuilder();
        int bytes = 0;
        for (int i = 0; i < conteudo.length(); ) {
            int codigo = conteudo.codePointAt(i);
            String caractere = new String(Character.toChars(codigo));
            int tamanho = caractere.getBytes(StandardCharsets.UTF_8).length;
            if (bytes + tamanho > 75) {
                ics.append(atual).append("\r\n ");
                atual.setLength(0);
                bytes = 1; // o espaço da continuação conta
            }
            atual.append(caractere);
            bytes += tamanho;
            i += Character.charCount(codigo);
        }
        ics.append(atual).append("\r\n");
    }
}
