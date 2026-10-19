"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Aviso } from "@/componentes/Aviso";
import { Botao, BotaoIcone } from "@/componentes/Botao";
import { Carregando, EstadoErro, EstadoVazio, Esqueleto } from "@/componentes/Estados";
import { Janela } from "@/componentes/Janela";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { dataPorExtenso, diaEMes, emMinutos, hoje, inicioDaSemana, somarDias } from "@/lib/formatos";
import { linkPublicoSemProtocolo } from "@/lib/site";
import type { Agenda, Agendamento, Bloqueio, DiaDaSemana, ResumoSemana, Servico } from "@/lib/tipos";
import { useBusca } from "@/lib/useBusca";

import { CabecalhoDaTela } from "../CabecalhoDaTela";
import { JanelaBloqueio } from "../JanelaBloqueio";
import { useSessao } from "../Sessao";
import { AgendaDaSemana } from "./AgendaDaSemana";
import { AgendaDoDia } from "./AgendaDoDia";
import { BotaoCopiarLink } from "../BotaoCopiarLink";
import { DetalheDoAgendamento } from "./DetalheDoAgendamento";

type Modo = "dia" | "semana";

function agoraEmMinutos(): number {
  const agora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  return emMinutos(agora);
}

/** A tela principal do painel: a agenda do dia ou da semana, com o contador da semana. */
export function TelaAgenda() {
  const { sessao } = useSessao();
  const parametros = useSearchParams();
  const mostrarToast = useToast();
  const [diaDeHoje] = useState(hoje);
  const [minutoAtual] = useState(agoraEmMinutos);
  const [modo, setModo] = useState<Modo>("dia");
  const [data, setData] = useState(diaDeHoje);
  const [escolhido, setEscolhido] = useState<Agendamento | null>(null);
  const [bloqueando, setBloqueando] = useState(false);
  const [bloqueioEscolhido, setBloqueioEscolhido] = useState<Bloqueio | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const segunda = inicioDaSemana(data);
  const [de, ate] = modo === "dia" ? [data, data] : [segunda, somarDias(segunda, 6)];
  const agenda = useBusca<Agenda>(apiPainel.caminhoAgenda(de, ate));
  const resumo = useBusca<ResumoSemana>(apiPainel.caminhoResumo);
  const semana = useBusca<DiaDaSemana[]>(apiPainel.caminhoHorarios);
  const servicos = useBusca<Servico[]>(apiPainel.caminhoServicos);

  function atualizar() {
    agenda.recarregar();
    resumo.recarregar();
  }

  function andar(passo: number) {
    setData((atual) => somarDias(atual, modo === "dia" ? passo : passo * 7));
  }

  async function removerBloqueio() {
    if (!bloqueioEscolhido) return;
    setRemovendo(true);
    try {
      await apiPainel.excluirBloqueio(bloqueioEscolhido.id);
      mostrarToast("Bloqueio removido. Os horários voltaram para a sua página.");
      setBloqueioEscolhido(null);
      atualizar();
    } catch (e) {
      mostrarToast(e instanceof ErroDaApi ? e.message : "Não foi possível remover.", "erro");
    } finally {
      setRemovendo(false);
    }
  }

  const titulo =
    modo === "dia"
      ? `${data === diaDeHoje ? "Hoje, " : ""}${dataPorExtenso(data)}`
      : `Semana de ${diaEMes(segunda)} a ${diaEMes(somarDias(segunda, 6))}`;
  const semServicos = servicos.dados?.length === 0;
  const diaDaSemanaIso = ((new Date(`${data}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

  return (
    <main id="conteudo" className="grid gap-6 p-4 lg:p-8">
      <CabecalhoDaTela
        titulo="Agenda"
        acoes={
          <Botao variante="secundario" icone="cadeado" onClick={() => setBloqueando(true)}>
            Bloquear horário
          </Botao>
        }
      />

      {(parametros.get("bemvindo") || semServicos) && (
        <Aviso tipo="info" titulo={parametros.get("bemvindo") ? "Sua agenda foi criada" : "Falta pouco para receber agendamentos"}>
          <ol className="grid list-decimal gap-1 pl-5">
            <li>
              <Link href="/painel/servicos">Cadastre seus serviços</Link> com duração e preço.
            </li>
            <li>
              <Link href="/painel/horarios">Confira seus horários</Link>: começamos com segunda a sexta, 9h às 18h, e sábado de manhã.
            </li>
            <li>
              <Link href="/painel/link">Compartilhe seu link</Link> com os clientes.
            </li>
          </ol>
        </Aviso>
      )}

      <section aria-label="Resumo da semana">
        {resumo.dados ? (
          <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Indicador rotulo="Agendados na semana" valor={resumo.dados.agendados} />
            <Indicador rotulo="A confirmar" valor={resumo.dados.aConfirmar} destaque={resumo.dados.aConfirmar > 0} />
            <Indicador rotulo="Confirmados" valor={resumo.dados.confirmados} />
            <Indicador rotulo="Hoje" valor={resumo.dados.hoje} />
          </dl>
        ) : resumo.erro ? (
          <p className="text-pequeno text-erro">Não foi possível carregar o resumo da semana.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Esqueleto key={i} className="h-[76px] rounded-m" />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BotaoIcone icone="chevron-esquerda" rotulo={modo === "dia" ? "Dia anterior" : "Semana anterior"} onClick={() => andar(-1)} className="border-[1.5px] border-linha-forte bg-superficie" />
          <h2 className="font-texto text-h3 font-bold first-letter:uppercase" aria-live="polite">
            {titulo}
          </h2>
          <BotaoIcone icone="chevron-direita" rotulo={modo === "dia" ? "Próximo dia" : "Próxima semana"} onClick={() => andar(1)} className="border-[1.5px] border-linha-forte bg-superficie" />
          {data !== diaDeHoje && (
            <Botao variante="fantasma" onClick={() => setData(diaDeHoje)}>
              Hoje
            </Botao>
          )}
        </div>
        <div role="group" aria-label="Ver por" className="inline-flex rounded-m border-[1.5px] border-linha-forte bg-superficie p-1">
          {(["dia", "semana"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              aria-pressed={modo === opcao}
              onClick={() => setModo(opcao)}
              className="min-h-10 rounded-p px-4 font-semibold capitalize text-tinta aria-pressed:bg-caneta aria-pressed:text-white"
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      {agenda.erro ? (
        <EstadoErro mensagem={agenda.erro.message} aoTentarDeNovo={agenda.recarregar} />
      ) : !agenda.dados || !semana.dados ? (
        <Carregando texto="Carregando a agenda…">
          <Esqueleto className="h-[480px] rounded-m" />
        </Carregando>
      ) : modo === "semana" ? (
        <AgendaDaSemana
          segunda={segunda}
          hoje={diaDeHoje}
          agendamentos={agenda.dados.agendamentos}
          bloqueios={agenda.dados.bloqueios}
          semana={semana.dados}
          aoEscolher={setEscolhido}
          aoAbrirDia={(dia) => {
            setData(dia);
            setModo("dia");
          }}
        />
      ) : agenda.dados.agendamentos.length === 0 && agenda.dados.bloqueios.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum agendamento neste dia"
          acao={<BotaoCopiarLink slug={sessao.negocio.slug} />}
        >
          <p>
            Quando um cliente marcar pelo seu link, o horário aparece aqui. Seu link:{" "}
            <strong className="break-all font-hora text-tinta">{linkPublicoSemProtocolo(sessao.negocio.slug)}</strong>
          </p>
        </EstadoVazio>
      ) : (
        <AgendaDoDia
          agendamentos={agenda.dados.agendamentos}
          bloqueios={agenda.dados.bloqueios}
          expediente={semana.dados.find((d) => d.diaSemana === diaDaSemanaIso)}
          agoraEmMinutos={data === diaDeHoje ? minutoAtual : null}
          aoEscolher={setEscolhido}
          aoEscolherBloqueio={setBloqueioEscolhido}
        />
      )}

      <DetalheDoAgendamento agendamento={escolhido} aoFechar={() => setEscolhido(null)} aoMudar={atualizar} />
      <JanelaBloqueio aberta={bloqueando} aoFechar={() => setBloqueando(false)} aoBloquear={atualizar} diaInicial={data < diaDeHoje ? diaDeHoje : data} />
      <Janela
        aberta={bloqueioEscolhido !== null}
        aoFechar={() => setBloqueioEscolhido(null)}
        titulo="Remover bloqueio?"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setBloqueioEscolhido(null)}>
              Voltar
            </Botao>
            <Botao variante="perigo" icone="lixeira" carregando={removendo} textoCarregando="Removendo…" onClick={removerBloqueio}>
              Remover bloqueio
            </Botao>
          </>
        }
      >
        {bloqueioEscolhido && (
          <p>
            Os horários de {dataPorExtenso(bloqueioEscolhido.data)}
            {bloqueioEscolhido.diaInteiro ? "" : `, das ${bloqueioEscolhido.inicio} às ${bloqueioEscolhido.fim},`} voltam a aparecer na sua página.
          </p>
        )}
      </Janela>
    </main>
  );
}

function Indicador({ rotulo, valor, destaque = false }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className={`grid gap-1 rounded-m border-[1.5px] p-4 ${destaque ? "border-aviso bg-aviso-fundo" : "border-linha bg-superficie"}`}>
      <dt className="text-pequeno text-tinta-suave">{rotulo}</dt>
      <dd className="font-titulo text-[1.75rem] font-extrabold leading-none tabular-nums">{valor}</dd>
    </div>
  );
}
