package com.agendafacil.bloqueio;

import java.time.Instant;

import com.agendafacil.negocio.Negocio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Folga, feriado ou compromisso: um intervalo em que ninguém consegue marcar. */
@Entity
@Table(name = "bloqueio")
public class Bloqueio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    @Column(nullable = false)
    private Instant inicio;

    @Column(nullable = false)
    private Instant fim;

    @Column(length = 80)
    private String motivo;

    protected Bloqueio() {
    }

    public Bloqueio(Negocio negocio, Instant inicio, Instant fim, String motivo) {
        this.negocio = negocio;
        this.inicio = inicio;
        this.fim = fim;
        this.motivo = motivo;
    }

    public Long getId() {
        return id;
    }

    public Instant getInicio() {
        return inicio;
    }

    public Instant getFim() {
        return fim;
    }

    public String getMotivo() {
        return motivo;
    }
}
