"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Aviso } from "@/componentes/Aviso";
import { Carregando, EstadoErro, EstadoVazio, Esqueleto } from "@/componentes/Estados";
import { Icone } from "@/componentes/Icone";
import { Passos } from "@/componentes/Passos";
import { apiPublica, ErroDaApi } from "@/lib/api";
import type { DadosDoCliente } from "@/lib/esquemas";
import {
  dataPorExtenso,
  deMinutos,
  emMinutos,
  formatarDuracao,
  formatarPreco,
  hoje,
  linkWhatsapp,
} from "@/lib/formatos";
import type { DiaDisponivel, HorarioSugerido, HorariosLivres, NegocioPublico, Servico } from "@/lib/tipos";
import { useBusca } from "@/lib/useBusca";

// O formulário (com React Hook Form e Zod) só é baixado no passo 3: a primeira tela abre mais rápido no celular.
const FormularioAgendamento = dynamic(() => import("./FormularioAgendamento").then((m) => m.FormularioAgendamento), {
  loading: () => <Esqueleto className="h-[280px] rounded-m" />,
});
import { SeletorDeDias } from "./SeletorDeDias";
import { SeletorDeHorarios } from "./SeletorDeHorarios";

const TOTAL_DE_PASSOS = 3;

/**
 * O fluxo do cliente: serviço → dia e horário → dados → confirmação.
 * As escolhas ficam no endereço (?servico=1&data=2026-10-20&horario=10:20):
 * o botão Voltar do celular funciona e dá para compartilhar o link de um passo.
 */
export function FluxoDeAgendamento({ negocio }: { negocio: NegocioPublico }) {
  const parametros = useSearchParams();
  const servico = negocio.servicos.find((s) => String(s.id) === parametros.get("servico")) ?? null;
  const data = parametros.get("data");
  const horario = parametros.get("horario");
  // nome e WhatsApp ficam aqui, acima dos passos: voltar para trocar o dia não apaga o que foi digitado
  const [dadosDoCliente, setDadosDoCliente] = useState<DadosDoCliente>({ clienteNome: "", clienteWhatsapp: "" });

  if (!servico) {
    return <PassoServico negocio={negocio} />;
  }
  if (!data || !horario) {
    return <PassoHorario negocio={negocio} servico={servico} dataEscolhida={data} />;
  }
  return (
    <PassoDados
      negocio={negocio}
      servico={servico}
      data={data}
      horario={horario}
      dadosDoCliente={dadosDoCliente}
      aoMudarDados={setDadosDoCliente}
    />
  );
}

/** Monta o endereço com as escolhas atuais trocando só o que mudou. */
function useLinkComEscolhas() {
  const pathname = usePathname();
  const parametros = useSearchParams();
  return useCallback(
    (mudancas: Record<string, string | null>) => {
      const novos = new URLSearchParams(parametros.toString());
      for (const [chave, valor] of Object.entries(mudancas)) {
        if (valor === null) novos.delete(chave);
        else novos.set(chave, valor);
      }
      const consulta = novos.toString();
      return consulta ? `${pathname}?${consulta}` : pathname;
    },
    [pathname, parametros],
  );
}

function Cabecalho({ negocio, voltarPara, passo, nomeDoPasso }: { negocio: NegocioPublico; voltarPara?: string; passo: number; nomeDoPasso: string }) {
  return (
    <header className="border-b border-linha bg-superficie">
      <div className="mx-auto grid max-w-cliente gap-4 px-4 pb-4 pt-4">
        {voltarPara ? (
          <div className="flex items-center justify-between gap-4">
            <Link href={voltarPara} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-p px-2 font-bold text-tinta no-underline hover:bg-caneta-clara">
              <Icone nome="chevron-esquerda" />
              Voltar
            </Link>
            <span className="truncate text-pequeno text-tinta-suave">{negocio.nome}</span>
          </div>
        ) : (
          <div className="grid gap-3 pt-4">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-m bg-tinta font-titulo text-h2 font-extrabold text-white" aria-hidden="true">
                {iniciais(negocio.nome)}
              </span>
              <h1>{negocio.nome}</h1>
            </div>
            {negocio.endereco && (
              <p className="flex items-center gap-3 text-tinta-suave">
                <Icone nome="local" />
                {negocio.endereco}
              </p>
            )}
          </div>
        )}
        <Passos atual={passo} total={TOTAL_DE_PASSOS} nome={nomeDoPasso} />
      </div>
    </header>
  );
}

function Rodape({ negocio }: { negocio: NegocioPublico }) {
  return (
    <footer className="mt-12 border-t border-linha">
      <div className="mx-auto grid max-w-cliente gap-2 px-4 py-6 text-pequeno text-tinta-suave">
        <p>
          Dúvidas?{" "}
          <a href={linkWhatsapp(negocio.whatsapp, `Olá, ${negocio.nome}! Tenho uma dúvida sobre o agendamento.`)} target="_blank" rel="noopener noreferrer">
            Fale com {negocio.nome} no WhatsApp
          </a>
        </p>
        <p>
          Agenda feita com <span className="font-titulo font-extrabold text-tinta">Agenda Fácil</span>
        </p>
      </div>
    </footer>
  );
}

function PassoServico({ negocio }: { negocio: NegocioPublico }) {
  const linkCom = useLinkComEscolhas();
  return (
    <>
      <Cabecalho negocio={negocio} passo={1} nomeDoPasso="Serviço" />
      <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 pt-8">
        <div className="grid gap-1">
          <h2 className="text-[1.5rem]">Escolha o serviço</h2>
          <p className="text-tinta-suave">Você marca em 3 passos, sem criar conta.</p>
        </div>
        {negocio.servicos.length === 0 ? (
          <EstadoVazio titulo="Nenhum serviço para agendar agora" icone="tesoura">
            <p>
              {negocio.nome} ainda não abriu a agenda online. Fale pelo{" "}
              <a href={linkWhatsapp(negocio.whatsapp, `Olá, ${negocio.nome}! Quero marcar um horário.`)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </EstadoVazio>
        ) : (
          <ul className="grid gap-2">
            {negocio.servicos.map((servico) => (
              <li key={servico.id}>
                <Link
                  href={linkCom({ servico: String(servico.id), data: null, horario: null })}
                  className="group flex min-h-[72px] items-center gap-4 rounded-m border-[1.5px] border-linha bg-superficie p-4 text-tinta no-underline shadow-1 transition-colors duration-[120ms] hover:border-caneta hover:bg-[#fbfcff] hover:text-tinta"
                >
                  <span className="grid flex-1 gap-0.5">
                    <span className="text-h3 font-bold">{servico.nome}</span>
                    <span className="text-pequeno text-tinta-suave">{formatarDuracao(servico.duracaoMinutos)}</span>
                  </span>
                  {servico.precoCentavos !== null ? (
                    <span className="whitespace-nowrap font-bold">{formatarPreco(servico.precoCentavos)}</span>
                  ) : (
                    <span className="whitespace-nowrap text-pequeno text-tinta-suave">Preço no local</span>
                  )}
                  <Icone nome="chevron-direita" className="size-5 text-tinta-suave transition-transform duration-[120ms] group-hover:translate-x-0.5 group-hover:text-caneta" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Rodape negocio={negocio} />
    </>
  );
}

function PassoHorario({ negocio, servico, dataEscolhida }: { negocio: NegocioPublico; servico: Servico; dataEscolhida: string | null }) {
  const linkCom = useLinkComEscolhas();
  const dias = useBusca<DiaDisponivel[]>(apiPublica.caminhoDias(negocio.slug, servico.id));
  // sem dia no endereço, abre no primeiro dia com horário livre
  const primeiroLivre = dias.dados?.find((dia) => dia.situacao === "LIVRE")?.data ?? null;
  const dia = dataEscolhida ?? primeiroLivre;
  const horarios = useBusca<HorariosLivres>(dia ? apiPublica.caminhoHorarios(negocio.slug, servico.id, dia) : null);

  return (
    <>
      <Cabecalho negocio={negocio} voltarPara={linkCom({ servico: null, data: null, horario: null })} passo={2} nomeDoPasso="Dia e horário" />
      <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 pt-8">
        <div className="grid gap-1">
          <h2 className="text-[1.75rem] font-extrabold">Quando?</h2>
          <p>
            <strong>{servico.nome}</strong> <span className="text-tinta-suave">· {formatarDuracao(servico.duracaoMinutos)}</span>
          </p>
        </div>

        {dias.erro ? (
          <EstadoErro mensagem={dias.erro.message} aoTentarDeNovo={dias.recarregar} />
        ) : !dias.dados ? (
          <Carregando texto="Carregando os dias disponíveis…">
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 6 }, (_, i) => (
                <Esqueleto key={i} className="h-[84px] w-[68px] shrink-0 rounded-m" />
              ))}
            </div>
          </Carregando>
        ) : !primeiroLivre && !dataEscolhida ? (
          <EstadoVazio titulo="Agenda cheia nos próximos dias">
            <p>
              Não sobrou horário para {servico.nome.toLowerCase()} nas próximas duas semanas. Fale com {negocio.nome} pelo{" "}
              <a href={linkWhatsapp(negocio.whatsapp, `Olá, ${negocio.nome}! Queria marcar ${servico.nome}, mas não achei horário.`)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </EstadoVazio>
        ) : (
          <>
            <SeletorDeDias dias={dias.dados} selecionado={dia} hoje={hoje()} criarLink={(d) => linkCom({ data: d, horario: null })} />
            <section aria-live="polite" aria-busy={horarios.carregando}>
              {dia && <h3 className="sr-only">Horários de {dataPorExtenso(dia)}</h3>}
              {horarios.erro ? (
                <EstadoErro mensagem={horarios.erro.message} aoTentarDeNovo={horarios.recarregar} />
              ) : horarios.carregando || !horarios.dados ? (
                <Carregando texto="Carregando os horários livres…">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <Esqueleto key={i} className="h-alvo" />
                    ))}
                  </div>
                </Carregando>
              ) : horarios.dados.horarios.length === 0 ? (
                <EstadoVazio titulo="Sem horários neste dia">
                  <p>Escolha outro dia na lista acima.</p>
                </EstadoVazio>
              ) : (
                <SeletorDeHorarios
                  horarios={horarios.dados.horarios}
                  criarLink={(h) => linkCom({ data: dia, horario: h })}
                />
              )}
            </section>
            <p className="text-pequeno text-tinta-suave">
              Aparecem só os horários livres com tempo para o serviço escolhido ({formatarDuracao(servico.duracaoMinutos)}). Horário de Brasília.
            </p>
          </>
        )}
      </main>
      <Rodape negocio={negocio} />
    </>
  );
}

function PassoDados({
  negocio,
  servico,
  data,
  horario,
  dadosDoCliente,
  aoMudarDados,
}: {
  negocio: NegocioPublico;
  servico: Servico;
  data: string;
  horario: string;
  dadosDoCliente: DadosDoCliente;
  aoMudarDados: (dados: DadosDoCliente) => void;
}) {
  const router = useRouter();
  const linkCom = useLinkComEscolhas();
  const [conflito, setConflito] = useState<{ data: string; horario: string; sugestoes: HorarioSugerido[]; mensagem: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const horarioRecusado = conflito !== null && conflito.data === data && conflito.horario === horario;
  const fim = deMinutos(emMinutos(horario) + servico.duracaoMinutos);
  const preco = formatarPreco(servico.precoCentavos);

  async function agendar(dados: DadosDoCliente) {
    setErro(null);
    try {
      const agendamento = await apiPublica.agendar(negocio.slug, { servicoId: servico.id, data, horario, ...dados });
      router.push(`/${negocio.slug}/confirmado/${agendamento.codigo}`);
    } catch (e) {
      if (!(e instanceof ErroDaApi)) {
        setErro("Algo deu errado. Tente de novo.");
        return;
      }
      if (e.status === 409) {
        setConflito({ data, horario, mensagem: e.message, sugestoes: (e.corpo.horariosProximos as HorarioSugerido[]) ?? [] });
        return;
      }
      if (e.status === 400 && Object.keys(e.erros).length > 0) {
        return e.erros;
      }
      setErro(e.message);
    }
  }

  return (
    <>
      <Cabecalho negocio={negocio} voltarPara={linkCom({ horario: null })} passo={3} nomeDoPasso="Seus dados" />
      <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 pt-8">
        <h2 className="text-[1.75rem] font-extrabold">Confira e confirme</h2>

        {horarioRecusado && (
          <Aviso tipo="atencao" titulo={`O horário das ${horario} acabou de ser reservado`} papel="alert">
            <p>Outra pessoa confirmou um pouco antes. Seu nome e WhatsApp continuam aqui.</p>
            {conflito.sugestoes.length > 0 ? (
              <>
                <p>Escolha outro horário:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {conflito.sugestoes.map((s) => (
                    <li key={`${s.data}-${s.horario}`}>
                      <Link
                        href={linkCom({ data: s.data, horario: s.horario })}
                        replace
                        className="flex min-h-alvo min-w-24 flex-col items-center justify-center rounded-p border-[1.5px] border-linha-forte bg-superficie px-3 font-hora font-semibold text-tinta no-underline hover:border-caneta hover:bg-caneta-clara"
                      >
                        {s.horario}
                        {s.data !== data && <span className="font-texto text-pequeno font-normal text-tinta-suave">{dataPorExtenso(s.data).split(",")[0]}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>{conflito.mensagem}</p>
            )}
            <Link href={linkCom({ horario: null })} className="mt-1 justify-self-start">
              Ver outros dias
            </Link>
          </Aviso>
        )}

        {erro && <Aviso tipo="erro" titulo="Não foi possível agendar" papel="alert"><p>{erro}</p></Aviso>}

        <ul className="divide-y divide-linha rounded-m border-[1.5px] border-linha bg-superficie shadow-1">
          <ItemDoResumo icone="tesoura" rotulo="Serviço" alterar={linkCom({ servico: null, data: null, horario: null })}>
            {servico.nome} · {formatarDuracao(servico.duracaoMinutos)} · {preco ?? "preço no local"}
          </ItemDoResumo>
          <ItemDoResumo icone="calendario" rotulo="Quando" alterar={linkCom({ horario: null })}>
            {dataPorExtenso(data)}
            <br />
            {horarioRecusado ? (
              <span className="text-tinta-suave">Escolha um novo horário acima</span>
            ) : (
              <span className="font-hora">
                {horario} às {fim}
              </span>
            )}
          </ItemDoResumo>
          {negocio.endereco && (
            <ItemDoResumo icone="local" rotulo="Onde">
              {negocio.endereco}
            </ItemDoResumo>
          )}
        </ul>

        <FormularioAgendamento
          valoresIniciais={dadosDoCliente}
          aoMudar={aoMudarDados}
          aoEnviar={agendar}
          bloqueado={horarioRecusado}
          avisoBloqueado="O botão volta a funcionar quando você escolher um novo horário."
        />
        <p className="text-pequeno text-tinta-suave">
          Seu nome e WhatsApp vão só para {negocio.nome}, para falar sobre este horário.{" "}
          <Link href="/privacidade">Como seus dados são usados</Link>
        </p>
      </main>
      <Rodape negocio={negocio} />
    </>
  );
}

function ItemDoResumo({
  icone,
  rotulo,
  alterar,
  children,
}: {
  icone: "tesoura" | "calendario" | "local";
  rotulo: string;
  alterar?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-4 p-4">
      <Icone nome={icone} className="size-6 text-tinta-suave" />
      <div className="grid flex-1 gap-0.5">
        <span className="text-pequeno text-tinta-suave">{rotulo}</span>
        <span className="font-bold">{children}</span>
      </div>
      {alterar && (
        <Link href={alterar} className="inline-flex min-h-11 items-center font-bold" aria-label={`Alterar ${rotulo.toLowerCase()}`}>
          Alterar
        </Link>
      )}
    </li>
  );
}

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
