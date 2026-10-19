import type { ReactNode } from "react";

import { Icone, type NomeDoIcone } from "./Icone";

type Tipo = "erro" | "atencao" | "info" | "sucesso";

const estilos: Record<Tipo, { classes: string; icone: NomeDoIcone }> = {
  erro: { classes: "bg-erro-fundo text-erro", icone: "alerta" },
  atencao: { classes: "bg-aviso-fundo text-aviso", icone: "alerta" },
  info: { classes: "bg-caneta-clara text-caneta", icone: "info" },
  sucesso: { classes: "bg-sucesso-fundo text-sucesso", icone: "check" },
};

/** Aviso dentro da página. A cor sempre vem com ícone e título: nunca só a cor. */
export function Aviso({
  tipo,
  titulo,
  children,
  papel,
}: {
  tipo: Tipo;
  titulo: string;
  children?: ReactNode;
  /** "alert" para erros que aparecem depois de uma ação (o leitor de tela lê na hora). */
  papel?: "alert" | "status";
}) {
  const { classes, icone } = estilos[tipo];
  return (
    <div role={papel} className={`flex items-start gap-4 rounded-m border-[1.5px] border-current p-4 ${classes}`}>
      <Icone nome={icone} className="mt-0.5 size-5" />
      <div className="grid gap-1 text-tinta">
        <p className="font-bold">{titulo}</p>
        {children}
      </div>
    </div>
  );
}
