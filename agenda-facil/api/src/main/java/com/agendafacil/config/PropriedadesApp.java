package com.agendafacil.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configurações próprias do Agenda Fácil (bloco "app" do application.yml). */
@ConfigurationProperties(prefix = "app")
public record PropriedadesApp(Jwt jwt, Cookie cookie, Cors cors) {

    public record Jwt(String segredo, Duration validade) {
    }

    /**
     * seguro: true quando a API estiver em HTTPS (o navegador só manda o cookie por HTTPS).
     * dominio: vazio no ambiente local. Em produção, com o front em app.seudominio.com e a API
     * em api.seudominio.com, use "seudominio.com" para os dois enxergarem o cookie.
     */
    public record Cookie(boolean seguro, String dominio) {
    }

    public record Cors(List<String> origens) {
    }
}
