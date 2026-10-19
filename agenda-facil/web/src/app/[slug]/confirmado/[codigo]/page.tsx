import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LinkBotao } from "@/componentes/Botao";
import { Esqueleto } from "@/componentes/Estados";
import { Icone } from "@/componentes/Icone";
import { apiPublica, ErroDaApi } from "@/lib/api";
import { diaDaSemana, diaEMes, formatarPreco, linkWhatsapp } from "@/lib/formatos";

export const metadata: Metadata = {
  title: "Seu horário",
  // a página tem o nome do cliente: não deve aparecer em buscadores
  robots: { index: false, follow: false },
};

export default function PaginaConfirmado({ params }: PageProps<"/[slug]/confirmado/[codigo]">) {
  return (
    <Suspense fallback={<EsqueletoConfirmado />}>
      <Confirmacao params={params} />
    </Suspense>
  );
}

async function Confirmacao({ params }: { params: PageProps<"/[slug]/confirmado/[codigo]">["params"] }) {
  const { slug, codigo } = await params;
  let agendamento;
  try {
    agendamento = await apiPublica.agendamento(codigo);
  } catch (erro) {
    if (erro instanceof ErroDaApi && (erro.status === 404 || erro.status === 400)) notFound();
    throw erro;
  }
  if (agendamento.negocioSlug !== slug) notFound();

  const primeiroNome = agendamento.clienteNome.split(" ")[0];
  const preco = formatarPreco(agendamento.precoCentavos);
  const cancelado = agendamento.status === "CANCELADO";
  // o texto do topo acompanha o status: a cliente pode abrir este link de novo depois de dias
  const topo = {
    A_CONFIRMAR: {
      titulo: "Horário reservado",
      texto: `Te esperamos, ${primeiroNome}. ${agendamento.negocioNome} vai confirmar pelo WhatsApp.`,
    },
    CONFIRMADO: { titulo: "Horário confirmado", texto: `${agendamento.negocioNome} confirmou. Te esperamos, ${primeiroNome}.` },
    CANCELADO: {
      titulo: "Horário cancelado",
      texto: `${agendamento.negocioNome} cancelou este horário. Se quiser, escolha outro dia ou fale pelo WhatsApp.`,
    },
  }[agendamento.status];
  const quando = `${diaDaSemana(agendamento.data)}, ${diaEMes(agendamento.data)}, às ${agendamento.inicio}`;
  const mensagem =
    `Olá, ${agendamento.negocioNome}! Acabei de agendar ${agendamento.servicoNome} para ${quando} pelo Agenda Fácil. ` +
    `Meu nome é ${agendamento.clienteNome}.`;

  return (
    <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 py-10">
      <div className="grid gap-3">
        <span className={`grid size-[60px] place-items-center rounded-full text-white ${cancelado ? "bg-erro" : "bg-sucesso"}`}>
          <Icone nome={cancelado ? "x" : "check"} className="size-8" />
        </span>
        <h1>{topo.titulo}</h1>
        <p className="text-tinta-suave">{topo.texto}</p>
      </div>

      <section aria-label="Seu horário" className={`overflow-hidden rounded-g bg-superficie shadow-2 ${cancelado ? "opacity-70" : ""}`}>
        <div className="grid gap-1 p-6">
          <p className="flex justify-between gap-4 text-pequeno font-bold uppercase tracking-[0.08em] text-tinta-suave">
            <span>{agendamento.negocioNome}</span>
            <span>Seu horário</span>
          </p>
          <p className="mt-2 font-semibold text-tinta-suave">{diaDaSemana(agendamento.data)}</p>
          <p className="font-titulo text-destaque font-extrabold">{diaEMes(agendamento.data)}</p>
          <p className={`font-hora text-[2rem] font-semibold ${cancelado ? "text-tinta-suave line-through" : "text-caneta"}`}>
            {agendamento.inicio} <span className="font-texto text-h3 text-tinta-suave">às</span> {agendamento.fim}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 font-semibold">
            <span className="inline-flex items-center gap-2">
              <Icone nome="tesoura" />
              {agendamento.servicoNome}
            </span>
            <span>{preco ?? "Preço no local"}</span>
          </p>
        </div>
        {agendamento.negocioEndereco && (
          <div className="flex items-start gap-3 border-t-2 border-dashed border-linha-forte bg-marca-texto p-6 text-tinta">
            <Icone nome="local" className="mt-0.5" />
            <div className="grid gap-1">
              <p>{agendamento.negocioEndereco}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamento.negocioEndereco)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="justify-self-start font-bold text-tinta hover:text-tinta"
              >
                Como chegar
              </a>
            </div>
          </div>
        )}
      </section>

      {cancelado ? (
        <div className="grid gap-3">
          <LinkBotao href={`/${agendamento.negocioSlug}`} icone="calendario" largo>
            Escolher outro horário
          </LinkBotao>
          <LinkBotao
            href={linkWhatsapp(agendamento.negocioWhatsapp, `Olá, ${agendamento.negocioNome}! Vi que meu horário de ${quando} foi cancelado.`)}
            icone="mensagem"
            variante="secundario"
            largo
            externo
          >
            Falar no WhatsApp
          </LinkBotao>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            <LinkBotao href={apiPublica.linkCalendario(agendamento.codigo)} icone="calendario" largo externo>
              Salvar na agenda do celular
            </LinkBotao>
            <LinkBotao href={linkWhatsapp(agendamento.negocioWhatsapp, mensagem)} icone="mensagem" variante="secundario" largo externo>
              Avisar no WhatsApp
            </LinkBotao>
          </div>

          <section className="grid gap-2 rounded-m border-[1.5px] border-linha bg-superficie p-6">
            <h2 className="font-texto text-h3 font-bold">Precisa mudar?</h2>
            <p className="text-tinta-suave">
              Para remarcar ou cancelar, fale com {agendamento.negocioNome} pelo WhatsApp. Guarde este link: ele mostra se o
              horário continua de pé.
            </p>
          </section>
        </>
      )}

      {!cancelado && (
        <p className="text-center text-pequeno text-tinta-suave">
          <Link href={`/${agendamento.negocioSlug}`}>Marcar outro horário</Link>
        </p>
      )}
    </main>
  );
}

function EsqueletoConfirmado() {
  return (
    <div role="status" className="mx-auto grid max-w-cliente gap-6 px-4 py-10">
      <span className="sr-only">Carregando seu horário…</span>
      <Esqueleto className="size-[60px] rounded-full" />
      <Esqueleto className="h-9 w-64" />
      <Esqueleto className="h-64 rounded-g" />
      <Esqueleto className="h-alvo rounded-m" />
    </div>
  );
}
