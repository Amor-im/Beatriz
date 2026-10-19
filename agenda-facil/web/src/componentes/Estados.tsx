import type { ReactNode } from "react";

import { Botao } from "./Botao";
import { Icone, type NomeDoIcone } from "./Icone";

/** Tela vazia: explica por que está vazio e oferece a próxima ação. */
export function EstadoVazio({
  icone = "calendario",
  titulo,
  children,
  acao,
}: {
  icone?: NomeDoIcone;
  titulo: string;
  children?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-2 rounded-m border-[1.5px] border-dashed border-linha-forte bg-superficie px-6 py-8 text-center">
      <span className="mb-2 grid size-14 place-items-center rounded-full bg-marca-texto text-tinta">
        <Icone nome={icone} className="size-7" />
      </span>
      <h2 className="text-h2">{titulo}</h2>
      {children && <div className="max-w-[40ch] text-tinta-suave">{children}</div>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

/** Erro ao carregar: diz o que aconteceu e oferece tentar de novo. */
export function EstadoErro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo?: () => void }) {
  return (
    <div role="alert" className="grid justify-items-center gap-2 rounded-m border-[1.5px] border-erro bg-erro-fundo px-6 py-8 text-center">
      <Icone nome="alerta" className="size-8 text-erro" />
      <h2 className="text-h2">Não foi possível carregar</h2>
      <p className="max-w-[44ch] text-tinta">{mensagem}</p>
      {aoTentarDeNovo && (
        <Botao variante="secundario" className="mt-4" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Botao>
      )}
    </div>
  );
}

/** Esqueleto: reserva o formato do conteúdo enquanto carrega. */
export function Esqueleto({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-brilhar rounded-p bg-[linear-gradient(90deg,#e9ebf2_25%,#f3f4f8_50%,#e9ebf2_75%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

/** Bloco de carregamento com texto para leitor de tela. */
export function Carregando({ texto = "Carregando…", children }: { texto?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{texto}</span>
      {children}
    </div>
  );
}
