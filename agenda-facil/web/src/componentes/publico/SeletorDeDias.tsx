import Link from "next/link";

import { dataPorExtenso, diaDaSemanaCurto, diaDoMes } from "@/lib/formatos";
import type { DiaDisponivel } from "@/lib/tipos";

/** Faixa com os próximos 14 dias. Dia fechado ou lotado aparece, mas não dá para escolher. */
export function SeletorDeDias({
  dias,
  selecionado,
  hoje,
  criarLink,
}: {
  dias: DiaDisponivel[];
  selecionado: string | null;
  hoje: string;
  criarLink: (data: string) => string;
}) {
  return (
    <nav aria-label="Escolha o dia" className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
      <ul className="flex gap-2">
        {dias.map((dia) => {
          const ehHoje = dia.data === hoje;
          const escolhido = dia.data === selecionado;
          const legenda = dia.situacao === "FECHADO" ? "fechado" : dia.situacao === "LOTADO" ? "lotado" : ehHoje ? "hoje" : null;
          const conteudo = (
            <>
              <span className="text-pequeno font-bold">{diaDaSemanaCurto(dia.data)}</span>
              <span className="font-titulo text-[1.625rem] font-extrabold leading-none">{diaDoMes(dia.data)}</span>
              {legenda && (
                <span className={`rounded-full px-1.5 text-[0.8125rem] font-semibold ${legenda === "hoje" ? "bg-marca-texto text-tinta" : ""}`}>
                  {legenda}
                </span>
              )}
            </>
          );
          const classes =
            "flex h-[84px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-m border-[1.5px] no-underline";

          if (dia.situacao !== "LIVRE") {
            return (
              <li key={dia.data}>
                <span
                  className={`${classes} ${dia.situacao === "FECHADO" ? "border-dashed" : ""} border-linha-forte bg-papel text-tinta-suave`}
                  aria-label={`${dataPorExtenso(dia.data)}: ${legenda}`}
                >
                  {conteudo}
                </span>
              </li>
            );
          }
          return (
            <li key={dia.data}>
              <Link
                href={criarLink(dia.data)}
                replace
                scroll={false}
                aria-current={escolhido ? "date" : undefined}
                aria-label={`${dataPorExtenso(dia.data)}${ehHoje ? " (hoje)" : ""}: ${dia.livres} ${dia.livres === 1 ? "horário livre" : "horários livres"}`}
                className={`${classes} ${
                  escolhido
                    ? "border-2 border-caneta bg-caneta-clara text-caneta-escura"
                    : "border-linha-forte bg-superficie text-tinta hover:border-caneta hover:bg-caneta-clara"
                }`}
              >
                {conteudo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
