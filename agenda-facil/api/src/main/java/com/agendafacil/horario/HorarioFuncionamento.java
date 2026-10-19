package com.agendafacil.horario;

import java.time.DayOfWeek;
import java.time.LocalTime;

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

/** Um dia da semana em que o negócio abre. Dia sem registro = fechado. */
@Entity
@Table(name = "horario_funcionamento")
public class HorarioFuncionamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    /** 1 = segunda ... 7 = domingo (o mesmo número do DayOfWeek do Java). */
    @Column(name = "dia_semana", nullable = false)
    private short diaSemana;

    @Column(nullable = false)
    private LocalTime abre;

    @Column(nullable = false)
    private LocalTime fecha;

    @Column(name = "almoco_inicio")
    private LocalTime almocoInicio;

    @Column(name = "almoco_fim")
    private LocalTime almocoFim;

    protected HorarioFuncionamento() {
    }

    public HorarioFuncionamento(Negocio negocio, DayOfWeek dia, Expediente expediente) {
        this.negocio = negocio;
        this.diaSemana = (short) dia.getValue();
        atualizar(expediente);
    }

    public void atualizar(Expediente expediente) {
        this.abre = expediente.abre();
        this.fecha = expediente.fecha();
        this.almocoInicio = expediente.almocoInicio();
        this.almocoFim = expediente.almocoFim();
    }

    public DayOfWeek dia() {
        return DayOfWeek.of(diaSemana);
    }

    public Expediente expediente() {
        return new Expediente(abre, fecha, almocoInicio, almocoFim);
    }
}
