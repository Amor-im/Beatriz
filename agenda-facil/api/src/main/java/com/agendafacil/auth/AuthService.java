package com.agendafacil.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agendafacil.erro.ConflitoException;
import com.agendafacil.erro.CredenciaisInvalidasException;
import com.agendafacil.erro.MuitasTentativasException;
import com.agendafacil.erro.NaoEncontradoException;
import com.agendafacil.erro.RegraDeNegocioException;
import com.agendafacil.horario.HorarioService;
import com.agendafacil.negocio.Negocio;
import com.agendafacil.negocio.NegocioRepository;
import com.agendafacil.negocio.NegocioRequest;
import com.agendafacil.negocio.Slugs;
import com.agendafacil.seguranca.LimitadorDeTentativas;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    // Login: no máximo 10 tentativas por minuto vindas do mesmo IP
    // e 5 senhas erradas para o mesmo e-mail, a partir do mesmo IP, em 15 minutos.
    // A chave junta e-mail e IP: só pelo e-mail, qualquer pessoa trancaria o dono fora da própria conta.
    static final int MAX_TENTATIVAS_POR_IP = 10;
    static final Duration JANELA_IP = Duration.ofMinutes(1);
    static final int MAX_FALHAS_POR_EMAIL = 5;
    static final Duration JANELA_EMAIL = Duration.ofMinutes(15);
    // Cadastro: no máximo 10 tentativas por hora vindas do mesmo IP. Conta toda tentativa, até as recusadas:
    // o cadastro diz se o e-mail já tem conta (para quem errou de tela), e o limite impede usar isso em massa.
    static final int MAX_CADASTROS_POR_IP = 10;
    static final Duration JANELA_CADASTRO = Duration.ofHours(1);

    private final DonoRepository donos;
    private final NegocioRepository negocios;
    private final HorarioService horarios;
    private final PasswordEncoder codificadorDeSenha;
    private final TokenService tokens;
    private final LimitadorDeTentativas limitador;

    /**
     * Hash de uma senha qualquer, usado quando o e-mail não existe: assim a resposta demora
     * o mesmo tanto nos dois casos e ninguém descobre quais e-mails têm conta pelo tempo.
     */
    private final String hashDeComparacao;

    public AuthService(DonoRepository donos, NegocioRepository negocios, HorarioService horarios,
            PasswordEncoder codificadorDeSenha, TokenService tokens, LimitadorDeTentativas limitador) {
        this.donos = donos;
        this.negocios = negocios;
        this.horarios = horarios;
        this.codificadorDeSenha = codificadorDeSenha;
        this.tokens = tokens;
        this.limitador = limitador;
        this.hashDeComparacao = codificadorDeSenha.encode("senha-de-comparacao-sem-uso");
    }

    /** Resultado do login: o token vai para o cookie, a sessão vai no corpo da resposta. */
    public record Login(String token, SessaoResponse sessao) {
    }

    @Transactional
    public Login cadastrar(CadastroRequest dados, String ip) {
        String chaveIp = "cadastro:" + ip;
        if (limitador.excedeu(chaveIp, MAX_CADASTROS_POR_IP, JANELA_CADASTRO)) {
            throw new MuitasTentativasException("Muitas tentativas de cadastro a partir desta rede. Tente mais tarde.", JANELA_CADASTRO);
        }
        limitador.registrar(chaveIp, JANELA_CADASTRO);
        validarTamanhoDaSenha(dados.senha());
        NegocioRequest dadosDoNegocio = dados.negocio();
        Slugs.validarNaoReservado(dadosDoNegocio.slug());
        if (donos.existsByEmailIgnoreCase(dados.email())) {
            throw new ConflitoException("Já existe uma conta com esse e-mail. Tente entrar.");
        }
        if (negocios.existsBySlug(dadosDoNegocio.slug())) {
            throw new ConflitoException("Esse endereço já está em uso. Escolha outro.");
        }

        Dono dono = donos.save(new Dono(dados.nome(), dados.email(), codificadorDeSenha.encode(dados.senha())));
        Negocio negocio = negocios.save(new Negocio(dono, dadosDoNegocio.nome(), dadosDoNegocio.slug(),
            dadosDoNegocio.whatsapp(), dadosDoNegocio.endereco()));
        horarios.criarPadrao(negocio);

        log.info("Conta criada: dono {} com o negócio {}", dono.getId(), negocio.getSlug());
        return new Login(tokens.gerar(dono), SessaoResponse.de(dono, negocio));
    }

    @Transactional(readOnly = true)
    public Login entrar(EntrarRequest dados, String ip) {
        String chaveIp = "entrar:ip:" + ip;
        String chaveEmail = "entrar:email:" + dados.email() + ":" + ip;
        if (limitador.excedeu(chaveIp, MAX_TENTATIVAS_POR_IP, JANELA_IP)) {
            throw new MuitasTentativasException("Muitas tentativas seguidas. Espere um minuto e tente de novo.", JANELA_IP);
        }
        if (limitador.excedeu(chaveEmail, MAX_FALHAS_POR_EMAIL, JANELA_EMAIL)) {
            throw new MuitasTentativasException(
                "Muitas senhas erradas seguidas. Por segurança, espere 15 minutos.", JANELA_EMAIL);
        }
        limitador.registrar(chaveIp, JANELA_IP);

        Dono dono = donos.findByEmailIgnoreCase(dados.email()).orElse(null);
        boolean senhaConfere = senhaDentroDoLimite(dados.senha())
            && codificadorDeSenha.matches(dados.senha(), dono == null ? hashDeComparacao : dono.getSenhaHash());

        if (dono == null || !senhaConfere) {
            limitador.registrar(chaveEmail, JANELA_EMAIL);
            log.warn("Login recusado vindo de {}", ip);
            // a mesma mensagem para e-mail inexistente e senha errada
            throw new CredenciaisInvalidasException();
        }

        limitador.limpar(chaveEmail);
        Negocio negocio = negocios.findByDonoId(dono.getId())
            .orElseThrow(() -> new NaoEncontradoException("Negócio não encontrado."));
        return new Login(tokens.gerar(dono), SessaoResponse.de(dono, negocio));
    }

    @Transactional(readOnly = true)
    public SessaoResponse sessao(Long donoId) {
        Dono dono = donos.findById(donoId)
            .orElseThrow(() -> new NaoEncontradoException("Conta não encontrada."));
        Negocio negocio = negocios.findByDonoId(donoId)
            .orElseThrow(() -> new NaoEncontradoException("Negócio não encontrado."));
        return SessaoResponse.de(dono, negocio);
    }

    /** O BCrypt só considera os primeiros 72 bytes; letras com acento ocupam 2 bytes cada. */
    private static boolean senhaDentroDoLimite(String senha) {
        return senha.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    private static void validarTamanhoDaSenha(String senha) {
        if (!senhaDentroDoLimite(senha)) {
            throw new RegraDeNegocioException("A senha ficou longa demais. Use até 72 caracteres, ou menos se tiver acentos.");
        }
    }
}
