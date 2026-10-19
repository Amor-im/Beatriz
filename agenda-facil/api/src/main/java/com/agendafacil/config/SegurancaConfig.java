package com.agendafacil.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.util.WebUtils;

import com.agendafacil.auth.CookieDeSessao;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import jakarta.servlet.http.Cookie;

/**
 * Regras de segurança da API.
 *
 * - Rotas públicas: cadastro, login, página pública do negócio e o Swagger.
 * - Todo o resto exige um token JWT válido, que fica num cookie HttpOnly
 *   (o JavaScript da página não consegue ler, então um script malicioso não rouba o login).
 */
@Configuration
public class SegurancaConfig {

    private static final String[] ROTAS_PUBLICAS = {
        "/api/auth/cadastro", "/api/auth/entrar", "/api/auth/sair",
        "/api/publico/**",
        "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**",
        "/error"
    };

    @Bean
    public SecurityFilterChain filtroDeSeguranca(HttpSecurity http, BearerTokenResolver leitorDeToken,
            AuthenticationEntryPoint naoAutenticado) throws Exception {
        http
            // API sem sessão no servidor. O cookie usa SameSite=Lax e o CORS só aceita o front,
            // então outro site não consegue fazer requisições em nome do dono (CSRF).
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(rotas -> rotas
                .requestMatchers(ROTAS_PUBLICAS).permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth
                .bearerTokenResolver(leitorDeToken)
                .authenticationEntryPoint(naoAutenticado)
                .jwt(Customizer.withDefaults()))
            .exceptionHandling(erros -> erros.authenticationEntryPoint(naoAutenticado));
        return http.build();
    }

    /** BCrypt: guarda só o "resumo" da senha, com sal aleatório. Nem quem tem acesso ao banco vê a senha. */
    @Bean
    public PasswordEncoder codificadorDeSenha() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecretKey chaveDoToken(PropriedadesApp propriedades) {
        String segredo = propriedades.jwt().segredo();
        if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "Defina JWT_SEGREDO no arquivo .env com pelo menos 32 caracteres (veja .env.example).");
        }
        return new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    public JwtEncoder codificadorDeToken(SecretKey chave) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chave));
    }

    @Bean
    public JwtDecoder leitorDeJwt(SecretKey chave) {
        return NimbusJwtDecoder.withSecretKey(chave).macAlgorithm(MacAlgorithm.HS256).build();
    }

    /**
     * De onde vem o token: do cookie de sessão (o caminho normal do front) ou do cabeçalho
     * Authorization (útil para testar no Swagger). Nas rotas públicas o token é ignorado,
     * para um cookie vencido não bloquear quem só quer marcar um horário.
     */
    @Bean
    public BearerTokenResolver leitorDeToken() {
        DefaultBearerTokenResolver cabecalho = new DefaultBearerTokenResolver();
        return requisicao -> {
            String caminho = requisicao.getRequestURI();
            if (caminho.startsWith("/api/publico/") || caminho.startsWith("/api/auth/entrar")
                    || caminho.startsWith("/api/auth/cadastro") || caminho.startsWith("/api/auth/sair")) {
                return null;
            }
            Cookie cookie = WebUtils.getCookie(requisicao, CookieDeSessao.NOME);
            if (cookie != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
            return cabecalho.resolve(requisicao);
        };
    }

    /** Resposta 401 em JSON, no mesmo formato dos outros erros da API. */
    @Bean
    public AuthenticationEntryPoint naoAutenticado() {
        return (requisicao, resposta, excecao) -> {
            resposta.setStatus(HttpStatus.UNAUTHORIZED.value());
            resposta.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            resposta.setCharacterEncoding(StandardCharsets.UTF_8.name());
            resposta.getWriter().write("""
                {"type":"about:blank","title":"Não autenticado","status":401,\
                "detail":"Entre na sua conta para continuar."}""");
        };
    }

    /** CORS: só o front configurado em CORS_ORIGENS pode chamar a API pelo navegador, com cookie. */
    @Bean
    public CorsConfigurationSource configuracaoCors(PropriedadesApp propriedades) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(propriedades.cors().origens());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/api/**", cors);
        return fonte;
    }
}
