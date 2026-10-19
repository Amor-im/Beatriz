"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, Entrada, Interruptor, Selecao } from "@/componentes/Campo";
import { Janela } from "@/componentes/Janela";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { dataPorExtenso, hoje } from "@/lib/formatos";
import { opcoesDeHorario } from "@/lib/horarios";

const esquema = z
  .object({
    data: z.string().min(1, "Escolha o dia."),
    diaInteiro: z.boolean(),
    inicio: z.string(),
    fim: z.string(),
    motivo: z.string().trim().max(80, "Use até 80 caracteres."),
  })
  .refine((dados) => dados.diaInteiro || dados.fim > dados.inicio, {
    path: ["fim"],
    message: "O fim precisa ser depois do início.",
  });
type DadosDoBloqueio = z.infer<typeof esquema>;

/** Bloquear um horário (folga, consulta, feriado): ninguém consegue marcar nesse intervalo. */
export function JanelaBloqueio({
  aberta,
  aoFechar,
  aoBloquear,
  diaInicial,
}: {
  aberta: boolean;
  aoFechar: () => void;
  aoBloquear: () => void;
  diaInicial?: string;
}) {
  const mostrarToast = useToast();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DadosDoBloqueio>({
    resolver: zodResolver(esquema),
    values: { data: diaInicial ?? hoje(), diaInteiro: false, inicio: "12:00", fim: "13:00", motivo: "" },
  });
  const diaInteiro = useWatch({ control, name: "diaInteiro" });
  const horarios = opcoesDeHorario();

  function fechar() {
    setErro(null);
    reset();
    aoFechar();
  }

  const bloquear = handleSubmit(async (dados) => {
    setErro(null);
    try {
      await apiPainel.criarBloqueio({
        data: dados.data,
        diaInteiro: dados.diaInteiro,
        inicio: dados.diaInteiro ? undefined : dados.inicio,
        fim: dados.diaInteiro ? undefined : dados.fim,
        motivo: dados.motivo || undefined,
      });
      mostrarToast(`Horário bloqueado em ${dataPorExtenso(dados.data)}`);
      aoBloquear();
      fechar();
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    }
  });

  return (
    <Janela aberta={aberta} aoFechar={fechar} titulo="Bloquear horário">
      <form onSubmit={bloquear} noValidate className="grid gap-5">
        <p className="text-tinta-suave">Durante o bloqueio, esses horários somem da sua página de agendamento.</p>
        {erro && (
          <Aviso tipo="atencao" titulo="Não deu para bloquear" papel="alert">
            <p>{erro}</p>
          </Aviso>
        )}
        <Campo rotulo="Dia" erro={errors.data?.message}>
          {(ids) => <Entrada {...ids} {...register("data")} type="date" min={hoje()} />}
        </Campo>
        <Interruptor rotulo="O dia inteiro" {...register("diaInteiro")} />
        {!diaInteiro && (
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Das" erro={errors.inicio?.message}>
              {(ids) => (
                <Selecao {...ids} {...register("inicio")} className="font-hora">
                  {horarios.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </Selecao>
              )}
            </Campo>
            <Campo rotulo="Até" erro={errors.fim?.message}>
              {(ids) => (
                <Selecao {...ids} {...register("fim")} className="font-hora">
                  {horarios.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </Selecao>
              )}
            </Campo>
          </div>
        )}
        <Campo rotulo="Motivo" opcional dica="Só você vê. Ex.: consulta médica, feriado." erro={errors.motivo?.message}>
          {(ids) => <Entrada {...ids} {...register("motivo")} />}
        </Campo>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Botao variante="fantasma" onClick={fechar}>
            Voltar
          </Botao>
          <Botao type="submit" icone="cadeado" carregando={isSubmitting} textoCarregando="Bloqueando…">
            Bloquear horário
          </Botao>
        </div>
      </form>
    </Janela>
  );
}
