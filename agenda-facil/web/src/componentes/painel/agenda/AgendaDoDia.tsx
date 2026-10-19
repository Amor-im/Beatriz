import { Icone } from "@/componentes/Icone";
import { Status } from "@/componentes/Status";
import { deMinutos, emMinutos } from "@/lib/formatos";
import type { Agendamento, Bloqueio, DiaDaSemana } from "@/lib/tipos";

const PX_POR_MINUTO = 1.5;

/**
 * Linha do tempo de um dia: cada agendamento ocupa a altura da sua duração.
 * Os cancelados ficam numa lista embaixo (o horário deles já está livre).
 */
export function AgendaDoDia({
  agendamentos,
  bloqueios,
  expediente,
  agoraEmMinutos,
  aoEscolher,
  aoEscolherBloqueio,
}: {
  agendamentos: Agendamento[];
  bloqueios: Bloqueio[];
  expediente: DiaDaSemana | undefined;
  /** Só quando o dia mostrado é hoje: desenha a linha de "agora". */
  agoraEmMinutos: number | null;
  aoEscolher: (agendamento: Agendamento) => void;
  aoEscolherBloqueio: (bloqueio: Bloqueio) => void;
}) {
  const ativos = agendamentos.filter((a) => a.status !== "CANCELADO");
  const cancelados = agendamentos.filter((a) => a.status === "CANCELADO");
  const aberto = expediente?.aberto && expediente.abre && expediente.fecha;

  // a régua vai da abertura ao fechamento, esticando se tiver agendamento fora disso
  const pontas = [
    ...(aberto ? [emMinutos(expediente.abre!), emMinutos(expediente.fecha!)] : []),
    ...ativos.flatMap((a) => [emMinutos(a.inicio), emMinutos(a.fim)]),
  ];
  const inicio = pontas.length ? Math.floor(Math.min(...pontas) / 60) * 60 : 9 * 60;
  const fim = pontas.length ? Math.ceil(Math.max(...pontas) / 60) * 60 : 18 * 60;
  const horas = Array.from({ length: (fim - inicio) / 60 + 1 }, (_, i) => inicio + i * 60);
  const posicao = (minuto: number) => (minuto - inicio) * PX_POR_MINUTO;

  const faixasBloqueadas = bloqueios.map((b) => ({
    bloqueio: b,
    de: b.diaInteiro ? inicio : Math.max(emMinutos(b.inicio), inicio),
    ate: b.diaInteiro || b.fim === "00:00" ? fim : Math.min(emMinutos(b.fim), fim),
  }));

  return (
    <div className="grid gap-4">
      {!aberto && (
        <p className="flex items-center gap-2 rounded-m bg-superficie p-4 text-tinta-suave">
          <Icone nome="info" />
          Fechado neste dia pelos seus horários de atendimento.
        </p>
      )}
      <div className="relative rounded-m border-[1.5px] border-linha bg-superficie" style={{ height: (fim - inicio) * PX_POR_MINUTO + 24 }}>
        {horas.map((minuto) => (
          <div key={minuto} className="absolute inset-x-0 flex items-start gap-2" style={{ top: posicao(minuto) + 12 }}>
            <span className="w-14 -translate-y-1/2 pl-3 font-hora text-pequeno text-tinta-suave">{deMinutos(minuto)}</span>
            <span className="h-px flex-1 bg-linha" />
          </div>
        ))}

        {aberto && expediente.almocoInicio && expediente.almocoFim && (
          <div
            className="absolute left-16 right-2 flex items-start rounded-p border border-dashed border-linha-forte bg-[repeating-linear-gradient(135deg,#f5f6fa_0_6px,#e9ebf2_6px_12px)] px-3 py-1 text-pequeno text-tinta-suave"
            style={{ top: posicao(emMinutos(expediente.almocoInicio)) + 12, height: (emMinutos(expediente.almocoFim) - emMinutos(expediente.almocoInicio)) * PX_POR_MINUTO }}
          >
            Almoço
          </div>
        )}

        {faixasBloqueadas.map(({ bloqueio, de, ate }) => (
          <button
            key={bloqueio.id}
            type="button"
            onClick={() => aoEscolherBloqueio(bloqueio)}
            className="absolute left-16 right-2 flex items-start gap-2 overflow-hidden rounded-p border-l-4 border-tinta-suave bg-[repeating-linear-gradient(135deg,#eef0f5_0_6px,#e1e4ec_6px_12px)] px-3 py-1 text-left text-pequeno text-tinta-suave hover:brightness-95"
            style={{ top: posicao(de) + 12, height: Math.max((ate - de) * PX_POR_MINUTO, 32) }}
          >
            <Icone nome="cadeado" className="mt-0.5 size-4" />
            <span>
              <span className="font-hora font-semibold">{bloqueio.diaInteiro ? "Dia inteiro" : `${bloqueio.inicio} às ${bloqueio.fim}`}</span>
              {" · "}Bloqueado{bloqueio.motivo ? ` · ${bloqueio.motivo}` : ""}
            </span>
          </button>
        ))}

        {agoraEmMinutos !== null && agoraEmMinutos >= inicio && agoraEmMinutos <= fim && (
          <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: posicao(agoraEmMinutos) + 12 }}>
            <span className="ml-1 rounded-full bg-caneta px-1.5 font-hora text-[0.75rem] font-semibold text-white">{deMinutos(agoraEmMinutos)}</span>
            <span className="h-0.5 flex-1 bg-caneta" />
          </div>
        )}

        {ativos.map((agendamento) => {
          const altura = Math.max((emMinutos(agendamento.fim) - emMinutos(agendamento.inicio)) * PX_POR_MINUTO - 4, 40);
          const confirmado = agendamento.status === "CONFIRMADO";
          return (
            <button
              key={agendamento.id}
              type="button"
              onClick={() => aoEscolher(agendamento)}
              className={`absolute left-16 right-2 overflow-hidden rounded-p border-[1.5px] border-l-4 bg-superficie px-3 py-1.5 text-left shadow-1 hover:bg-caneta-clara ${
                confirmado ? "border-sucesso" : "border-dashed border-aviso"
              }`}
              style={{ top: posicao(emMinutos(agendamento.inicio)) + 14, height: altura }}
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-hora font-semibold">{agendamento.inicio}</span>
                <span className="font-bold">{agendamento.clienteNome}</span>
                <span className="text-tinta-suave">{agendamento.servicoNome}</span>
                <Status valor={agendamento.status} />
              </span>
            </button>
          );
        })}
      </div>

      {cancelados.length > 0 && (
        <details className="rounded-m border-[1.5px] border-linha bg-superficie p-4">
          <summary className="cursor-pointer font-bold">
            {cancelados.length} {cancelados.length === 1 ? "cancelado" : "cancelados"} neste dia
          </summary>
          <ul className="mt-3 grid gap-2">
            {cancelados.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => aoEscolher(a)} className="flex w-full flex-wrap items-center gap-3 rounded-p p-2 text-left hover:bg-papel">
                  <span className="font-hora font-semibold text-tinta-suave line-through">{a.inicio}</span>
                  <span>{a.clienteNome}</span>
                  <span className="text-tinta-suave">{a.servicoNome}</span>
                  <Status valor={a.status} />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
