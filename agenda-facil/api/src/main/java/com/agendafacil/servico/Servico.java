package com.agendafacil.servico;

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

/** Corte, escova, manicure... Um negócio tem vários serviços (muitos para um). */
@Entity
@Table(name = "servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    @Column(nullable = false, length = 60)
    private String nome;

    @Column(name = "duracao_minutos", nullable = false)
    private int duracaoMinutos;

    /** Preço em centavos (R$ 45,00 = 4500): inteiro não tem erro de arredondamento. Opcional. */
    @Column(name = "preco_centavos")
    private Integer precoCentavos;

    /** Serviço desativado some da página pública, mas continua no histórico. */
    @Column(nullable = false)
    private boolean ativo = true;

    protected Servico() {
    }

    public Servico(Negocio negocio, String nome, int duracaoMinutos, Integer precoCentavos, boolean ativo) {
        this.negocio = negocio;
        atualizar(nome, duracaoMinutos, precoCentavos, ativo);
    }

    public void atualizar(String nome, int duracaoMinutos, Integer precoCentavos, boolean ativo) {
        this.nome = nome;
        this.duracaoMinutos = duracaoMinutos;
        this.precoCentavos = precoCentavos;
        this.ativo = ativo;
    }

    public Long getId() {
        return id;
    }

    public Negocio getNegocio() {
        return negocio;
    }

    public String getNome() {
        return nome;
    }

    public int getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public Integer getPrecoCentavos() {
        return precoCentavos;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
