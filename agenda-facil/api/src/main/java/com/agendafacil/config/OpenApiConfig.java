package com.agendafacil.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

/** Título e descrição do Swagger (abre em http://localhost:8080/swagger-ui). */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI documentacao() {
        return new OpenAPI()
            .info(new Info()
                .title("Agenda Fácil API")
                .version("0.1.0")
                .description("""
                    Agendamento online para pequenos negócios de serviço.
                    Rotas /api/publico/** são abertas (página do cliente). As demais exigem login:
                    use POST /api/auth/entrar aqui mesmo no Swagger, que o cookie de sessão é gravado
                    no navegador, ou cole o token em "Authorize"."""))
            .components(new Components().addSecuritySchemes("token",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
