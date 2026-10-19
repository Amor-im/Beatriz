"use client";

import { createContext, useContext } from "react";

import type { Sessao } from "@/lib/tipos";

type ContextoDaSessao = { sessao: Sessao; recarregarSessao: () => void };

export const ContextoSessao = createContext<ContextoDaSessao | null>(null);

/** Quem está logado e qual é o negócio. Só existe dentro do painel. */
export function useSessao(): ContextoDaSessao {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error("useSessao precisa estar dentro do painel.");
  return contexto;
}
