"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, Entrada, Interruptor, Selecao } from "@/componentes/Campo";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { esquemaServico, precoEmCentavos, type DadosDoServico } from "@/lib/esquemas";
import { formatarDuracao } from "@/lib/formatos";
import type { Servico } from "@/lib/tipos";

const DURACOES = [10, 15, 20, 30, 40, 45, 50, 60, 70, 75, 80, 90, 100, 120, 150, 180, 210, 240];

/** Criar ou editar um serviço. */
export function FormularioServico({
  servico,
  aoSalvar,
  aoCancelar,
}: {
  servico: Servico | null;
  aoSalvar: (salvo: Servico) => void;
  aoCancelar: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const duracoes = servico && !DURACOES.includes(servico.duracaoMinutos) ? [...DURACOES, servico.duracaoMinutos].sort((a, b) => a - b) : DURACOES;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosDoServico>({
    resolver: zodResolver(esquemaServico),
    defaultValues: {
      nome: servico?.nome ?? "",
      duracaoMinutos: String(servico?.duracaoMinutos ?? 30),
      preco: servico?.precoCentavos != null ? (servico.precoCentavos / 100).toFixed(2).replace(".", ",").replace(/,00$/, "") : "",
      ativo: servico?.ativo ?? true,
    },
  });

  const salvar = handleSubmit(async (dados) => {
    setErro(null);
    const corpo = {
      nome: dados.nome,
      duracaoMinutos: Number(dados.duracaoMinutos),
      precoCentavos: precoEmCentavos(dados.preco),
      ativo: dados.ativo,
    };
    try {
      aoSalvar(servico ? await apiPainel.salvarServico(servico.id, corpo) : await apiPainel.criarServico(corpo));
    } catch (e) {
      if (e instanceof ErroDaApi && e.erros.nome) {
        setError("nome", { message: e.erros.nome }, { shouldFocus: true });
        return;
      }
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    }
  });

  return (
    <form onSubmit={salvar} noValidate className="grid gap-5">
      {erro && (
        <Aviso tipo="erro" titulo="Não foi possível salvar" papel="alert">
          <p>{erro}</p>
        </Aviso>
      )}
      <Campo rotulo="Nome do serviço" erro={errors.nome?.message}>
        {(ids) => <Entrada {...ids} {...register("nome")} placeholder="Ex.: Corte" autoFocus />}
      </Campo>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Duração" dica="Usada para calcular os horários livres." erro={errors.duracaoMinutos?.message}>
          {(ids) => (
            <Selecao {...ids} {...register("duracaoMinutos")}>
              {duracoes.map((minutos) => (
                <option key={minutos} value={minutos}>
                  {formatarDuracao(minutos)}
                </option>
              ))}
            </Selecao>
          )}
        </Campo>
        <Campo rotulo="Preço" opcional dica="Em reais. Deixe vazio para não mostrar." erro={errors.preco?.message}>
          {(ids) => (
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta-suave" aria-hidden="true">
                R$
              </span>
              <Entrada {...ids} {...register("preco")} inputMode="decimal" placeholder="45,00" className="pl-11" />
            </div>
          )}
        </Campo>
      </div>
      <Interruptor rotulo="Aparece na página de agendamento" {...register("ativo")} />
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Botao variante="fantasma" onClick={aoCancelar}>
          Voltar
        </Botao>
        <Botao type="submit" carregando={isSubmitting} textoCarregando="Salvando…">
          {servico ? "Salvar serviço" : "Adicionar serviço"}
        </Botao>
      </div>
    </form>
  );
}
