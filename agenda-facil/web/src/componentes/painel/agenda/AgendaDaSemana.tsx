import { Icone } from "@/componentes/Icone";
import { Status } from "@/componentes/Status";
import { diaDaSemanaCurto, diaDoMes, somarDias } from "@/lib/formatos";
import type { Agendamento, Bloqueio, DiaDaSemana } from "@/lib/tipos";

/** A semana em colunas (computador) ou em lista (celular). */
export function AgendaDaSemana({
  segunda,
  hoje,
  agendamentos,
  bloqueios,
  semana,
  aoEscolher,
  aoAbrirDia,
}: {
  segunda: string;
  hoje: string;
  agendamentos: Agendamento[];
  bloqueios: Bloqueio[];
  semana: DiaDaSemana[];
  aoEscolher: (agendamento: Agendamento) => void;
  aoAbrirDia: (data: string) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(segunda, i));
  return (
    <ol className="grid gap-3 lg:grid-cols-7 lg:gap-2">
      {dias.map((data, i) => {
        const doDia = agendamentos.filter((a) => a.data === data && a.status !== "CANCELADO");
        const bloqueiosDoDia = bloqueios.filter((b) => b.data === data);
        const aberto = semana[i]?.aberto;
        return (
          <li
            key={data}
            className={`grid content-start gap-2 rounded-m border-[1.5px] bg-superficie p-3 ${data === hoje ? "border-caneta" : "border-linha"}`}
          >
            <button
              type="button"
              onClick={() => aoAbrirDia(data)}
              className="flex items-baseline justify-between gap-2 rounded-p text-left hover:text-caneta"
              aria-label={`Abrir o dia ${diaDoMes(data)}`}
            >
              <span>
                <span className="text-pequeno font-bold text-tinta-suave">{diaDaSemanaCurto(data)}</span>{" "}
                <span className="font-titulo text-h2 font-extrabold">{diaDoMes(data)}</span>
              </span>
              {data === hoje && <span className="rounded-full bg-marca-texto px-1.5 text-pequeno font-semibold text-tinta">hoje</span>}
            </button>
            {!aberto && doDia.length === 0 && bloqueiosDoDia.length === 0 && <p className="text-pequeno text-tinta-suave">Fechado</p>}
            {aberto && doDia.length === 0 && bloqueiosDoDia.length === 0 && <p className="text-pequeno text-tinta-suave">Sem agendamentos</p>}
            {bloqueiosDoDia.map((b) => (
              <p key={b.id} className="flex items-center gap-1 rounded-p bg-papel px-2 py-1 text-pequeno text-tinta-suave">
                <Icone nome="cadeado" className="size-4" />
                {b.diaInteiro ? "Dia bloqueado" : `${b.inicio}–${b.fim}`}
              </p>
            ))}
            <ul className="grid gap-2">
              {doDia.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => aoEscolher(a)}
                    className={`grid w-full gap-1 rounded-p border-[1.5px] border-l-4 p-2 text-left hover:bg-caneta-clara ${
                      a.status === "CONFIRMADO" ? "border-sucesso" : "border-dashed border-aviso"
                    }`}
                  >
                    <span className="font-hora font-semibold">{a.inicio}</span>
                    <span className="font-bold leading-tight">{a.clienteNome}</span>
                    <span className="text-pequeno text-tinta-suave">{a.servicoNome}</span>
                    <Status valor={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
