package com.agendafacil.agendamento;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioService;
import com.agendafacil.servico.Servico;
import com.agendafacil.servico.ServicoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/** Rotas da página pública: o cliente final agenda sem criar conta. */
@RestController
@RequestMapping("/api/publico")
@Tag(name = "Página pública (cliente)")
public class PublicoController {

    private final NegocioService negocios;
    private final ServicoService servicos;
    private final DisponibilidadeService disponibilidade;
    private final AgendamentoService agendamentos;

    public PublicoController(NegocioService negocios, ServicoService servicos,
            DisponibilidadeService disponibilidade, AgendamentoService agendamentos) {
        this.negocios = negocios;
        this.servicos = servicos;
        this.disponibilidade = disponibilidade;
        this.agendamentos = agendamentos;
    }

    @GetMapping("/negocios/{slug}")
    @Operation(summary = "Dados do negócio e serviços ativos")
    public NegocioPublicoResponse negocio(@PathVariable String slug) {
        Negocio negocio = negocios.porSlug(slug);
        return NegocioPublicoResponse.de(negocio, servicos.ativos(negocio.getId()));
    }

    @GetMapping("/negocios/{slug}/dias")
    @Operation(summary = "Próximos 14 dias com a situação de cada um (livre, lotado, fechado)")
    public List<DiaDisponivel> dias(@PathVariable String slug, @RequestParam Long servicoId) {
        Negocio negocio = negocios.porSlug(slug);
        Servico servico = servicos.ativoDoNegocio(negocio.getId(), servicoId);
        return disponibilidade.proximosDias(negocio, servico);
    }

    @GetMapping("/negocios/{slug}/horarios")
    @Operation(summary = "Horários livres de um dia para um serviço, calculados no servidor")
    public HorariosLivresResponse horarios(@PathVariable String slug, @RequestParam Long servicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        Negocio negocio = negocios.porSlug(slug);
        Servico servico = servicos.ativoDoNegocio(negocio.getId(), servicoId);
        return HorariosLivresResponse.de(data, disponibilidade.horariosLivres(negocio, servico, data));
    }

    @PostMapping("/negocios/{slug}/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Marca um horário. Responde 409 com sugestões se o horário já foi ocupado")
    public AgendamentoPublicoResponse agendar(@PathVariable String slug, @Valid @RequestBody NovoAgendamentoRequest dados,
            HttpServletRequest requisicao) {
        return agendamentos.agendar(slug, dados, requisicao.getRemoteAddr());
    }

    @GetMapping("/agendamentos/{codigo}")
    @Operation(summary = "Resumo do agendamento para a página de confirmação")
    public AgendamentoPublicoResponse agendamento(@PathVariable UUID codigo) {
        return agendamentos.porCodigo(codigo);
    }

    @GetMapping("/agendamentos/{codigo}/calendario.ics")
    @Operation(summary = "Arquivo .ics para adicionar o horário à agenda do celular")
    public ResponseEntity<String> calendario(@PathVariable UUID codigo) {
        return ResponseEntity.ok()
            .contentType(new MediaType("text", "calendar", StandardCharsets.UTF_8))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename("agendamento.ics").build().toString())
            .body(agendamentos.calendario(codigo));
    }
}
