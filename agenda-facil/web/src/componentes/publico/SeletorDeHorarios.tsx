import Link from "next/link";

import { periodoDoDia } from "@/lib/formatos";

/**
 * Os horários livres de um dia, separados em manhã, tarde e noite.
 * Cada horário é um link: tocar já leva para o próximo passo.
 * A lista vem pronta do servidor; aqui só mostramos.
 */
export function SeletorDeHorarios({
  horarios,
  criarLink,
  selecionado,
}: {
  horarios: string[];
  criarLink: (horario: string) => string;
  selecionado?: string;
}) {
  const periodos = (["Manhã", "Tarde", "Noite"] as const)
    .map((periodo) => ({ periodo, horarios: horarios.filter((h) => periodoDoDia(h) === periodo) }))
    .filter((grupo) => grupo.horarios.length > 0);

  return (
    <div className="grid gap-6">
      {periodos.map(({ periodo, horarios: doPeriodo }) => (
        <section key={periodo} aria-labelledby={`periodo-${periodo}`}>
          <h3 id={`periodo-${periodo}`} className="mb-2 text-h3 font-bold">
            {periodo} {periodo === "Noite" && <span className="text-pequeno font-normal text-tinta-suave">depois das 18h</span>}
          </h3>
          <ul className="grid grid-cols-3 gap-2">
            {doPeriodo.map((horario) => (
              <li key={horario}>
                <Link
                  href={criarLink(horario)}
                  aria-current={horario === selecionado ? "true" : undefined}
                  className="flex min-h-alvo items-center justify-center rounded-p border-[1.5px] border-linha-forte bg-superficie font-hora text-h3 font-semibold tabular-nums text-tinta no-underline transition-colors duration-[120ms] hover:border-caneta hover:bg-caneta-clara hover:text-caneta-escura aria-[current=true]:border-caneta aria-[current=true]:bg-caneta aria-[current=true]:text-white"
                >
                  {horario}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
