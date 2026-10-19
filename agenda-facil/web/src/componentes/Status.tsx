import type { StatusAgendamento } from "@/lib/tipos";

import { Icone, type NomeDoIcone } from "./Icone";

const status: Record<StatusAgendamento, { texto: string; classes: string; icone: NomeDoIcone }> = {
  CONFIRMADO: { texto: "Confirmado", classes: "bg-sucesso-fundo text-sucesso", icone: "check" },
  A_CONFIRMAR: { texto: "A confirmar", classes: "bg-aviso-fundo text-aviso", icone: "relogio" },
  CANCELADO: { texto: "Cancelado", classes: "bg-erro-fundo text-erro", icone: "x" },
};

/** Etiqueta de status: sempre ícone + texto (quem não distingue cores entende igual). */
export function Status({ valor }: { valor: StatusAgendamento }) {
  const { texto, classes, icone } = status[valor];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-pequeno font-bold ${classes}`}>
      <Icone nome={icone} className="size-[1em]" />
      {texto}
    </span>
  );
}
