"use client";

import { useState } from "react";

import { Botao, BotaoIcone } from "@/componentes/Botao";
import { Carregando, EstadoErro, Esqueleto } from "@/componentes/Estados";
import { Icone } from "@/componentes/Icone";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { dataPorExtenso } from "@/lib/formatos";
import type { Bloqueio, DiaDaSemana } from "@/lib/tipos";
import { useBusca } from "@/lib/useBusca";

import { CabecalhoDaTela } from "../CabecalhoDaTela";
import { JanelaBloqueio } from "../JanelaBloqueio";
import { FormularioHorarios } from "./FormularioHorarios";

/** Horários de atendimento da semana e as folgas/bloqueios dos próximos dias. */
export function TelaHorarios() {
  const semana = useBusca<DiaDaSemana[]>(apiPainel.caminhoHorarios);
  const bloqueios = useBusca<Bloqueio[]>(apiPainel.caminhoBloqueios);
  const mostrarToast = useToast();
  const [bloqueando, setBloqueando] = useState(false);
  const [removendo, setRemovendo] = useState<number | null>(null);

  async function remover(bloqueio: Bloqueio) {
    setRemovendo(bloqueio.id);
    try {
      await apiPainel.excluirBloqueio(bloqueio.id);
      mostrarToast("Bloqueio removido");
      bloqueios.recarregar();
    } catch (e) {
      mostrarToast(e instanceof ErroDaApi ? e.message : "Não foi possível remover.", "erro");
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <main id="conteudo" className="grid max-w-5xl gap-8 p-4 lg:p-8">
      <CabecalhoDaTela
        titulo="Quando você atende?"
        descricao="Os clientes só veem horários dentro destes intervalos. Para uma folga num dia específico, use “Bloquear horário”."
      />

      {semana.erro ? (
        <EstadoErro mensagem={semana.erro.message} aoTentarDeNovo={semana.recarregar} />
      ) : !semana.dados ? (
        <Carregando texto="Carregando seus horários…">
          <Esqueleto className="h-[520px] rounded-g" />
        </Carregando>
      ) : (
        <FormularioHorarios semana={semana.dados} aoSalvar={semana.recarregar} />
      )}

      <section aria-labelledby="titulo-bloqueios" className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="titulo-bloqueios">Folgas e bloqueios</h2>
            <p className="text-tinta-suave">Próximos 60 dias.</p>
          </div>
          <Botao variante="secundario" icone="cadeado" onClick={() => setBloqueando(true)}>
            Bloquear horário
          </Botao>
        </div>
        {bloqueios.erro ? (
          <EstadoErro mensagem={bloqueios.erro.message} aoTentarDeNovo={bloqueios.recarregar} />
        ) : !bloqueios.dados ? (
          <Esqueleto className="h-20 rounded-m" />
        ) : bloqueios.dados.length === 0 ? (
          <p className="rounded-m border-[1.5px] border-dashed border-linha-forte bg-superficie p-4 text-tinta-suave">
            Nenhum bloqueio marcado. Use quando tiver folga, feriado ou um compromisso.
          </p>
        ) : (
          <ul className="grid gap-2">
            {bloqueios.dados.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-m border-[1.5px] border-linha bg-superficie p-3">
                <Icone nome="cadeado" className="text-tinta-suave" />
                <div className="grid flex-1">
                  <span className="font-bold first-letter:uppercase">{dataPorExtenso(b.data)}</span>
                  <span className="text-pequeno text-tinta-suave">
                    {b.diaInteiro ? "Dia inteiro" : `${b.inicio} às ${b.fim}`}
                    {b.motivo && ` · ${b.motivo}`}
                  </span>
                </div>
                <BotaoIcone
                  icone="lixeira"
                  rotulo={`Remover bloqueio de ${dataPorExtenso(b.data)}`}
                  disabled={removendo === b.id}
                  onClick={() => remover(b)}
                  className="text-erro hover:bg-erro-fundo hover:text-erro"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <JanelaBloqueio aberta={bloqueando} aoFechar={() => setBloqueando(false)} aoBloquear={bloqueios.recarregar} />
    </main>
  );
}
