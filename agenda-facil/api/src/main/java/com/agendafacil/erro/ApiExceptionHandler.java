package com.agendafacil.erro;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Transforma exceções em respostas de erro padronizadas (formato ProblemDetail, RFC 9457):
 * { "title": "...", "status": 409, "detail": "mensagem para mostrar na tela", ...extras }
 * Assim o front trata todos os erros do mesmo jeito.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail dadosInvalidos(MethodArgumentNotValidException excecao) {
        Map<String, String> erros = new LinkedHashMap<>();
        for (FieldError erro : excecao.getBindingResult().getFieldErrors()) {
            erros.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        ProblemDetail problema = problema(HttpStatus.BAD_REQUEST, "Dados inválidos", "Confira os campos destacados.");
        problema.setProperty("erros", erros);
        return problema;
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class, HandlerMethodValidationException.class})
    public ProblemDetail requisicaoInvalida(Exception excecao) {
        return problema(HttpStatus.BAD_REQUEST, "Requisição inválida", "Algum dado da requisição está faltando ou em formato errado.");
    }

    @ExceptionHandler(NaoEncontradoException.class)
    public ProblemDetail naoEncontrado(NaoEncontradoException excecao) {
        return problema(HttpStatus.NOT_FOUND, "Não encontrado", excecao.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail rotaInexistente(NoResourceFoundException excecao) {
        return problema(HttpStatus.NOT_FOUND, "Não encontrado", "Esse endereço não existe na API.");
    }

    @ExceptionHandler(ConflitoException.class)
    public ProblemDetail conflito(ConflitoException excecao) {
        ProblemDetail problema = problema(HttpStatus.CONFLICT, "Conflito", excecao.getMessage());
        excecao.getExtras().forEach(problema::setProperty);
        return problema;
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ProblemDetail regraDeNegocio(RegraDeNegocioException excecao) {
        return problema(HttpStatus.UNPROCESSABLE_ENTITY, "Não foi possível concluir", excecao.getMessage());
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ProblemDetail credenciais(CredenciaisInvalidasException excecao) {
        return problema(HttpStatus.UNAUTHORIZED, "Não autenticado", excecao.getMessage());
    }

    @ExceptionHandler(MuitasTentativasException.class)
    public ResponseEntity<ProblemDetail> muitasTentativas(MuitasTentativasException excecao) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header(HttpHeaders.RETRY_AFTER, String.valueOf(excecao.getEsperar().toSeconds()))
            .body(problema(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas", excecao.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> inesperado(Exception excecao) {
        if (excecao instanceof ErrorResponse erroDoSpring) {
            // erros do próprio Spring MVC (método não permitido, formato não aceito...) já trazem o status certo
            return ResponseEntity.status(erroDoSpring.getStatusCode()).body(erroDoSpring.getBody());
        }
        log.error("Erro inesperado", excecao);
        return ResponseEntity.internalServerError().body(problema(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado",
            "Algo deu errado do nosso lado. Tente de novo em instantes."));
    }

    private static ProblemDetail problema(HttpStatus status, String titulo, String detalhe) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, detalhe);
        problema.setTitle(titulo);
        return problema;
    }
}
