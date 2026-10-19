package com.agendafacil.negocio;

import java.time.ZoneId;

import com.agendafacil.auth.Dono;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/** O salão, barbearia, estúdio ou quadra. Cada dono tem um negócio (relação um para um). */
@Entity
@Table(name = "negocio")
public class Negocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dono_id", nullable = false, unique = true)
    private Dono dono;

    @Column(nullable = false, length = 80)
    private String nome;

    /** O pedaço do link público: agendafacil.com/<slug>. */
    @Column(nullable = false, unique = true, length = 40)
    private String slug;

    /** Só dígitos, com DDD: 11987654321. */
    @Column(nullable = false, length = 11)
    private String whatsapp;

    @Column(length = 160)
    private String endereco;

    /** Fuso do negócio: todos os horários são mostrados e calculados nele. */
    @Column(nullable = false, length = 40)
    private String fuso = "America/Sao_Paulo";

    protected Negocio() {
    }

    public Negocio(Dono dono, String nome, String slug, String whatsapp, String endereco) {
        this.dono = dono;
        this.nome = nome;
        this.slug = slug;
        this.whatsapp = whatsapp;
        this.endereco = endereco;
    }

    public void atualizar(String nome, String slug, String whatsapp, String endereco) {
        this.nome = nome;
        this.slug = slug;
        this.whatsapp = whatsapp;
        this.endereco = endereco;
    }

    public ZoneId zona() {
        return ZoneId.of(fuso);
    }

    public Long getId() {
        return id;
    }

    public Dono getDono() {
        return dono;
    }

    public String getNome() {
        return nome;
    }

    public String getSlug() {
        return slug;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public String getEndereco() {
        return endereco;
    }
}
