"use client";

import { useState } from "react";

import { Aviso } from "@/componentes/Aviso";
import { Botao, LinkBotao } from "@/componentes/Botao";
import { Janela } from "@/componentes/Janela";
import { Status } from "@/componentes/Status";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { dataPorExtenso, linkWhatsapp, mascararWhatsapp } from "@/lib/formatos";
import type { Agendamento } from "@/lib/tipos";

import { useSessao } from "../Sessao";

/** Detalhe de um agendamento com as ações: confirmar, pedir confirmação no WhatsApp e cancelar. */
export function DetalheDoAgendamento({
  agendamento,
  aoFechar,
  aoMudar,
}: {
  agendamento: Agendamento | null;
  aoFechar: () => void;
  aoMudar: () => void;
}) {
  const { sessao } = useSessao();
  const mostrarToast = useToast();
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [cancelado, setCancelado] = useState<Agendamento | null>(null);
  const [ocupado, setOcupado] = useState<"confirmar" | "cancelar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const atual = cancelado ?? agendamento;

  function fechar() {
    setConfirmandoCancelamento(false);
    setCancelado(null);
    setErro(null);
    aoFechar();
  }

  async function executar(acao: "confirmar" | "cancelar") {
    if (!atual) return;
    setOcupado(acao);
    setErro(null);
    try {
      if (acao === "confirmar") {
        await apiPainel.confirmar(atual.id);
        mostrarToast(`Horário de ${atual.clienteNome} confirmado`);
        aoMudar();
        fechar();
      } else {
        const resultado = await apiPainel.cancelar(atual.id);
        setCancelado(resultado);
        setConfirmandoCancelamento(false);
        mostrarToast("Agendamento cancelado. O horário ficou livre de novo.");
        aoMudar();
      }
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    } finally {
      setOcupado(null);
    }
  }

  if (!atual) return <Janela aberta={false} aoFechar={fechar} titulo="">{null}</Janela>;

  const quando = `${dataPorExtenso(atual.data)}, às ${atual.inicio}`;
  const primeiroNome = atual.clienteNome.split(" ")[0];
  const pedirConfirmacao = linkWhatsapp(
    atual.clienteWhatsapp,
    `Olá, ${primeiroNome}! Aqui é do ${sessao.negocio.nome}. Seu horário de ${atual.servicoNome} está marcado para ${quando}. Pode confirmar?`,
  );
  const avisarCancelamento = linkWhatsapp(
    atual.clienteWhatsapp,
    `Olá, ${primeiroNome}! Aqui é do ${sessao.negocio.nome}. Precisamos cancelar seu horário de ${atual.servicoNome} de ${quando}. Quer marcar outro? É só escolher no nosso link.`,
  );

  return (
    <Janela aberta={agendamento !== null} aoFechar={fechar} titulo={atual.clienteNome}>
      <div className="grid gap-5">
        <div>
          <Status valor={atual.status} />
        </div>
        <dl className="grid gap-3">
          <div>
            <dt className="text-pequeno text-tinta-suave">Quando</dt>
            <dd className="font-bold">
              {dataPorExtenso(atual.data)} · <span className="font-hora">{atual.inicio} às {atual.fim}</span>
            </dd>
          </div>
          <div>
            <dt className="text-pequeno text-tinta-suave">Serviço</dt>
            <dd className="font-bold">{atual.servicoNome}</dd>
          </div>
          <div>
            <dt className="text-pequeno text-tinta-suave">WhatsApp</dt>
            <dd className="font-hora font-semibold">{mascararWhatsapp(atual.clienteWhatsapp)}</dd>
          </div>
        </dl>

        {erro && (
          <Aviso tipo="erro" titulo="Não foi possível concluir" papel="alert">
            <p>{erro}</p>
          </Aviso>
        )}

        {atual.status === "CANCELADO" ? (
          cancelado && (
            <div className="grid gap-3 border-t border-linha pt-4">
              <p>Avise {primeiroNome} que o horário foi cancelado:</p>
              <LinkBotao href={avisarCancelamento} icone="mensagem" variante="secundario" largo externo>
                Avisar no WhatsApp
              </LinkBotao>
            </div>
          )
        ) : confirmandoCancelamento ? (
          <div className="grid gap-3 border-t border-linha pt-4">
            <p className="font-bold">Cancelar o horário de {primeiroNome}?</p>
            <p className="text-tinta-suave">O horário fica livre de novo na sua página. Depois você pode avisar pelo WhatsApp.</p>
            <div className="flex flex-wrap gap-2">
              <Botao variante="perigo" icone="x" carregando={ocupado === "cancelar"} textoCarregando="Cancelando…" onClick={() => executar("cancelar")}>
                Sim, cancelar
              </Botao>
              <Botao variante="fantasma" onClick={() => setConfirmandoCancelamento(false)}>
                Voltar
              </Botao>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 border-t border-linha pt-4">
            {atual.status === "A_CONFIRMAR" && (
              <Botao icone="check" largo carregando={ocupado === "confirmar"} textoCarregando="Confirmando…" onClick={() => executar("confirmar")}>
                Marcar como confirmado
              </Botao>
            )}
            <LinkBotao href={pedirConfirmacao} icone="mensagem" variante="secundario" largo externo>
              {atual.status === "A_CONFIRMAR" ? "Pedir confirmação no WhatsApp" : "Falar no WhatsApp"}
            </LinkBotao>
            <Botao variante="perigo" icone="x" largo onClick={() => setConfirmandoCancelamento(true)}>
              Cancelar agendamento
            </Botao>
          </div>
        )}
      </div>
    </Janela>
  );
}
