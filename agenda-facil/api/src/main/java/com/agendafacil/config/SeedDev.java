package com.agendafacil.config;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.agendamento.Agendamento;
import com.agendafacil.agendamento.AgendamentoRepository;
import com.agendafacil.auth.Dono;
import com.agendafacil.auth.DonoRepository;
import com.agendafacil.horario.HorarioService;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioRepository;
import com.agendafacil.servico.Servico;
import com.agendafacil.servico.ServicoRepository;

/**
 * Dados de exemplo, só no perfil "dev" (./mvnw spring-boot:run -Dspring-boot.run.profiles=dev).
 * Tudo aqui é fictício: o negócio, os clientes, os telefones e os preços existem só para testar a tela.
 */
@Component
@Profile("dev")
public class SeedDev implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedDev.class);

    static final String EMAIL = "dono@example.com";
    static final String SENHA = "senha-de-exemplo-123";

    private final DonoRepository donos;
    private final NegocioRepository negocios;
    private final ServicoRepository servicos;
    private final AgendamentoRepository agendamentos;
    private final HorarioService horarios;
    private final PasswordEncoder codificadorDeSenha;
    private final Clock relogio;

    public SeedDev(DonoRepository donos, NegocioRepository negocios, ServicoRepository servicos,
            AgendamentoRepository agendamentos, HorarioService horarios, PasswordEncoder codificadorDeSenha,
            Clock relogio) {
        this.donos = donos;
        this.negocios = negocios;
        this.servicos = servicos;
        this.agendamentos = agendamentos;
        this.horarios = horarios;
        this.codificadorDeSenha = codificadorDeSenha;
        this.relogio = relogio;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (donos.existsByEmailIgnoreCase(EMAIL)) {
            return; // já foi criado numa execução anterior
        }
        Dono dono = donos.save(new Dono("Dono de exemplo", EMAIL, codificadorDeSenha.encode(SENHA)));
        Negocio negocio = negocios.save(new Negocio(dono, "Studio Exemplo", "studio-exemplo", "00900000000",
            "Rua Exemplo, 123 · Centro"));
        horarios.criarPadrao(negocio);

        Servico corte = servicos.save(new Servico(negocio, "Corte", 40, 4500, true));
        Servico escova = servicos.save(new Servico(negocio, "Escova", 30, 3500, true));
        servicos.save(new Servico(negocio, "Corte e escova", 70, null, true));
        servicos.save(new Servico(negocio, "Coloração", 120, null, false));

        // dois clientes de exemplo no próximo dia útil (seg a sex), dentro do horário padrão
        ZoneId zona = negocio.zona();
        LocalDate dia = LocalDate.now(relogio.withZone(zona)).plusDays(1);
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        agendar(negocio, corte, "Cliente de exemplo A", dia, LocalTime.of(9, 40), zona);
        Agendamento confirmado = agendar(negocio, escova, "Cliente de exemplo B", dia, LocalTime.of(14, 0), zona);
        confirmado.confirmar();

        log.info("Seed de desenvolvimento criado: entre com {} / {} e abra /studio-exemplo", EMAIL, SENHA);
    }

    private Agendamento agendar(Negocio negocio, Servico servico, String cliente, LocalDate dia, LocalTime hora, ZoneId zona) {
        Instant inicio = dia.atTime(hora).atZone(zona).toInstant();
        return agendamentos.save(new Agendamento(negocio, servico, cliente, "00900000000", inicio,
            inicio.plusSeconds(servico.getDuracaoMinutos() * 60L)));
    }
}
