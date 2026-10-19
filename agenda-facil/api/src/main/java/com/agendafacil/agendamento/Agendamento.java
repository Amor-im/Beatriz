package com.agendafacil.agendamento;

import java.time.Instant;
import java.util.UUID;

import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.servico.Servico;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Um horário marcado por um cliente. O cliente não tem conta: só nome e WhatsApp. */
@Entity
@Table(name = "agendamento")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    /** Código aleatório da página de confirmação. Ninguém adivinha o código de outra pessoa. */
    @Column(nullable = false, unique = true)
    private UUID codigo;

    @Column(name = "cliente_nome", nullable = false, length = 80)
    private String clienteNome;

    @Column(name = "cliente_whatsapp", nullable = false, length = 11)
    private String clienteWhatsapp;

    @Column(nullable = false)
    private Instant inicio;

    @Column(nullable = false)
    private Instant fim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAgendamento status = StatusAgendamento.A_CONFIRMAR;

    @Column(name = "criado_em", nullable = false, insertable = false, updatable = false)
    private Instant criadoEm;

    protected Agendamento() {
    }

    public Agendamento(Negocio negocio, Servico servico, String clienteNome, String clienteWhatsapp,
            Instant inicio, Instant fim) {
        this.negocio = negocio;
        this.servico = servico;
        this.codigo = UUID.randomUUID();
        this.clienteNome = clienteNome;
        this.clienteWhatsapp = clienteWhatsapp;
        this.inicio = inicio;
        this.fim = fim;
    }

    public void confirmar() {
        if (status == StatusAgendamento.CANCELADO) {
            throw new RegraDeNegocioException("Esse agendamento foi cancelado e não pode ser confirmado.");
        }
        status = StatusAgendamento.CONFIRMADO;
    }

    public void cancelar() {
        status = StatusAgendamento.CANCELADO;
    }

    public Long getId() {
        return id;
    }

    public Negocio getNegocio() {
        return negocio;
    }

    public Servico getServico() {
        return servico;
    }

    public UUID getCodigo() {
        return codigo;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public String getClienteWhatsapp() {
        return clienteWhatsapp;
    }

    public Instant getInicio() {
        return inicio;
    }

    public Instant getFim() {
        return fim;
    }

    public StatusAgendamento getStatus() {
        return status;
    }
}
