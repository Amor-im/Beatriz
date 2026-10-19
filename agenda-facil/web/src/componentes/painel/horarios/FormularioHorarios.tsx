"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Interruptor, Selecao } from "@/componentes/Campo";
import { Icone } from "@/componentes/Icone";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { NOMES_DOS_DIAS, opcoesDeHorario } from "@/lib/horarios";
import type { DiaDaSemana } from "@/lib/tipos";

const esquema = z
  .object({
    dias: z.array(z.object({ aberto: z.boolean(), abre: z.string(), fecha: z.string() })).length(7),
    temAlmoco: z.boolean(),
    almocoInicio: z.string(),
    almocoFim: z.string(),
  })
  .superRefine((dados, contexto) => {
    dados.dias.forEach((dia, i) => {
      if (dia.aberto && dia.fecha <= dia.abre) {
        contexto.addIssue({ code: "custom", path: ["dias", i, "fecha"], message: `Em ${NOMES_DOS_DIAS[i].toLowerCase()}, o fechamento precisa ser depois da abertura.` });
      }
    });
    if (dados.temAlmoco && dados.almocoFim <= dados.almocoInicio) {
      contexto.addIssue({ code: "custom", path: ["almocoFim"], message: "O fim do almoço precisa ser depois do início." });
    }
  });
type DadosDosHorarios = z.infer<typeof esquema>;

function valoresIniciais(semana: DiaDaSemana[]): DadosDosHorarios {
  const comAlmoco = semana.find((d) => d.aberto && d.almocoInicio && d.almocoFim);
  return {
    dias: semana.map((d) => ({ aberto: d.aberto, abre: d.abre ?? "09:00", fecha: d.fecha ?? "18:00" })),
    temAlmoco: Boolean(comAlmoco),
    almocoInicio: comAlmoco?.almocoInicio ?? "12:00",
    almocoFim: comAlmoco?.almocoFim ?? "13:00",
  };
}

/** "Segunda a sexta, 9:00 às 18:00" — agrupa dias seguidos com o mesmo horário. */
function resumoDaSemana(dias: DadosDosHorarios["dias"]): string[] {
  const linhas: string[] = [];
  let i = 0;
  while (i < 7) {
    let j = i;
    const chave = (d: DadosDosHorarios["dias"][number]) => (d.aberto ? `${d.abre}-${d.fecha}` : "fechado");
    while (j + 1 < 7 && chave(dias[j + 1]) === chave(dias[i])) j++;
    const nomes = i === j ? NOMES_DOS_DIAS[i] : `${NOMES_DOS_DIAS[i]} a ${NOMES_DOS_DIAS[j].toLowerCase()}`;
    linhas.push(dias[i].aberto ? `${nomes}, ${dias[i].abre} às ${dias[i].fecha}` : `${nomes}, fechado`);
    i = j + 1;
  }
  return linhas;
}

/** Dias e horários de atendimento + pausa de almoço. */
export function FormularioHorarios({ semana, aoSalvar }: { semana: DiaDaSemana[]; aoSalvar: () => void }) {
  const mostrarToast = useToast();
  const [erro, setErro] = useState<string | null>(null);
  const horarios = opcoesDeHorario();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DadosDosHorarios>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais(semana) });
  const dias = useWatch({ control, name: "dias" });
  const temAlmoco = useWatch({ control, name: "temAlmoco" });
  const almocoInicio = useWatch({ control, name: "almocoInicio" });
  const almocoFim = useWatch({ control, name: "almocoFim" });

  const salvar = handleSubmit(async (dados) => {
    setErro(null);
    const dias: DiaDaSemana[] = dados.dias.map((dia, i) => {
      // o almoço só entra nos dias em que ele cabe dentro do expediente (sábado até 13h, por exemplo, fica sem)
      const almocoCabe = dados.temAlmoco && dados.almocoInicio >= dia.abre && dados.almocoFim <= dia.fecha;
      return {
        diaSemana: i + 1,
        aberto: dia.aberto,
        abre: dia.aberto ? dia.abre : null,
        fecha: dia.aberto ? dia.fecha : null,
        almocoInicio: dia.aberto && almocoCabe ? dados.almocoInicio : null,
        almocoFim: dia.aberto && almocoCabe ? dados.almocoFim : null,
      };
    });
    try {
      await apiPainel.salvarHorarios(dias);
      reset(dados);
      mostrarToast("Horários salvos. A página de agendamento já usa os novos horários.");
      aoSalvar();
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    }
  });

  const primeiroErro = errors.dias?.find?.((d) => d?.fecha)?.fecha?.message ?? errors.almocoFim?.message;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
      <form onSubmit={salvar} noValidate className="grid gap-6 rounded-g border-[1.5px] border-linha bg-superficie p-4 shadow-1 md:p-6">
        {(erro || primeiroErro) && (
          <Aviso tipo="erro" titulo="Confira os horários" papel="alert">
            <p>{erro ?? primeiroErro}</p>
          </Aviso>
        )}
        <fieldset className="grid gap-1">
          <legend className="mb-2 font-bold">Dias e horários</legend>
          {NOMES_DOS_DIAS.map((nome, i) => {
            const aberto = dias[i]?.aberto;
            return (
              <div key={nome} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-linha py-2 sm:grid-cols-[180px_1fr]">
                <Interruptor rotulo={<span className="font-semibold">{nome}</span>} {...register(`dias.${i}.aberto`)} />
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <Selecao
                    {...register(`dias.${i}.abre`)}
                    disabled={!aberto}
                    aria-label={`${nome}: abre às`}
                    className="max-w-32 font-hora"
                    aria-invalid={Boolean(errors.dias?.[i]?.fecha)}
                  >
                    {horarios.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </Selecao>
                  <span className="text-tinta-suave">às</span>
                  <Selecao
                    {...register(`dias.${i}.fecha`)}
                    disabled={!aberto}
                    aria-label={`${nome}: fecha às`}
                    className="max-w-32 font-hora"
                    aria-invalid={Boolean(errors.dias?.[i]?.fecha)}
                  >
                    {horarios.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </Selecao>
                  {!aberto && <span className="text-pequeno text-tinta-suave">fechado</span>}
                </div>
              </div>
            );
          })}
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-2 font-bold">Intervalo de almoço</legend>
          <Interruptor rotulo="Paro para almoçar" {...register("temAlmoco")} />
          {temAlmoco && (
            <div className="flex items-center gap-2">
              <Selecao {...register("almocoInicio")} aria-label="Almoço começa às" className="max-w-32 font-hora">
                {horarios.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </Selecao>
              <span className="text-tinta-suave">às</span>
              <Selecao {...register("almocoFim")} aria-label="Almoço termina às" className="max-w-32 font-hora" aria-invalid={Boolean(errors.almocoFim)}>
                {horarios.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </Selecao>
            </div>
          )}
          <p className="text-pequeno text-tinta-suave">Vale para os dias em que o almoço cabe dentro do horário de atendimento.</p>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isDirty && <span className="text-pequeno text-tinta-suave">Alterações ainda não salvas</span>}
          <Botao type="submit" carregando={isSubmitting} textoCarregando="Salvando…">
            Salvar horários
          </Botao>
        </div>
      </form>

      <aside aria-labelledby="previa" className="grid gap-2 rounded-m border-[1.5px] border-linha bg-superficie p-4">
        <h2 id="previa" className="flex items-center gap-2 font-texto text-pequeno font-bold text-tinta-suave">
          <Icone nome="olho" className="size-4" />
          Na página do cliente
        </h2>
        <ul className="grid gap-1">
          {resumoDaSemana(dias).map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
        {temAlmoco && (
          <p>
            Almoço, {almocoInicio} às {almocoFim}
          </p>
        )}
        <p className="text-pequeno text-tinta-suave">O cliente só vê os horários em que cabe o serviço inteiro, contando a duração de cada um.</p>
      </aside>
    </div>
  );
}
