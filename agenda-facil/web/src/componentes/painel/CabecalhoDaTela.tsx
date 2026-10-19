import type { ReactNode } from "react";

/** Título da tela do painel + ações à direita. */
export function CabecalhoDaTela({ titulo, descricao, acoes }: { titulo: string; descricao?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1>{titulo}</h1>
        {descricao && <p className="max-w-[60ch] text-tinta-suave">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
