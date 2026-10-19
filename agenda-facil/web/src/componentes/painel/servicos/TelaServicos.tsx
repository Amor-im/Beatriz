"use client";

import { useState } from "react";

import { Aviso } from "@/componentes/Aviso";
import { Botao, BotaoIcone } from "@/componentes/Botao";
import { Interruptor } from "@/componentes/Campo";
import { Carregando, EstadoErro, EstadoVazio, Esqueleto } from "@/componentes/Estados";
import { Janela } from "@/componentes/Janela";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { formatarDuracao, formatarPreco } from "@/lib/formatos";
import type { Servico } from "@/lib/tipos";
import { useBusca } from "@/lib/useBusca";

import { CabecalhoDaTela } from "../CabecalhoDaTela";
import { FormularioServico } from "./FormularioServico";

/** Lista de serviços: criar, editar, ativar/desativar e excluir. */
export function TelaServicos() {
  const servicos = useBusca<Servico[]>(apiPainel.caminhoServicos);
  const mostrarToast = useToast();
  const [editando, setEditando] = useState<Servico | "novo" | null>(null);
  const [excluindo, setExcluindo] = useState<Servico | null>(null);
  const [erroAoExcluir, setErroAoExcluir] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);

  function salvo(servico: Servico) {
    mostrarToast(editando === "novo" ? `${servico.nome} adicionado` : `${servico.nome} salvo`);
    setEditando(null);
    servicos.recarregar();
  }

  async function alternarAtivo(servico: Servico) {
    setOcupado(servico.id);
    try {
      const { id, ...dados } = servico;
      await apiPainel.salvarServico(id, { ...dados, ativo: !servico.ativo });
      mostrarToast(servico.ativo ? `${servico.nome} saiu da página de agendamento` : `${servico.nome} voltou para a página de agendamento`);
      servicos.recarregar();
    } catch (e) {
      mostrarToast(e instanceof ErroDaApi ? e.message : "Não foi possível salvar.", "erro");
    } finally {
      setOcupado(null);
    }
  }

  async function excluir() {
    if (!excluindo) return;
    setErroAoExcluir(null);
    try {
      await apiPainel.excluirServico(excluindo.id);
      mostrarToast(`${excluindo.nome} excluído`);
      setExcluindo(null);
      servicos.recarregar();
    } catch (e) {
      setErroAoExcluir(e instanceof ErroDaApi ? e.message : "Não foi possível excluir.");
    }
  }

  function fecharExclusao() {
    setExcluindo(null);
    setErroAoExcluir(null);
  }

  return (
    <main id="conteudo" className="grid max-w-4xl gap-6 p-4 lg:p-8">
      <CabecalhoDaTela
        titulo="Serviços"
        descricao="O que você oferece, quanto tempo leva e quanto custa. A duração define os horários que o cliente vê."
        acoes={
          servicos.dados && servicos.dados.length > 0 ? (
            <Botao icone="mais" onClick={() => setEditando("novo")}>
              Adicionar serviço
            </Botao>
          ) : undefined
        }
      />

      {servicos.erro ? (
        <EstadoErro mensagem={servicos.erro.message} aoTentarDeNovo={servicos.recarregar} />
      ) : !servicos.dados ? (
        <Carregando texto="Carregando os serviços…">
          <div className="grid gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Esqueleto key={i} className="h-[76px] rounded-m" />
            ))}
          </div>
        </Carregando>
      ) : servicos.dados.length === 0 ? (
        <EstadoVazio
          titulo="Cadastre seu primeiro serviço"
          icone="tesoura"
          acao={
            <Botao icone="mais" onClick={() => setEditando("novo")}>
              Adicionar serviço
            </Botao>
          }
        >
          <p>Sem serviços, a sua página de agendamento fica vazia. Comece pelo que você mais faz.</p>
        </EstadoVazio>
      ) : (
        <ul className="grid gap-2">
          {servicos.dados.map((servico) => (
            <li
              key={servico.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-m border-[1.5px] bg-superficie p-4 shadow-1 ${servico.ativo ? "border-linha" : "border-dashed border-linha-forte"}`}
            >
              <div className="grid min-w-40 flex-1 gap-0.5">
                <p className="text-h3 font-bold">{servico.nome}</p>
                <p className="text-pequeno text-tinta-suave">
                  {formatarDuracao(servico.duracaoMinutos)}
                  {servico.precoCentavos !== null && ` · ${formatarPreco(servico.precoCentavos)}`}
                  {!servico.ativo && " · fora da página"}
                </p>
              </div>
              <Interruptor
                rotulo={<span className="text-pequeno">{servico.ativo ? "Ativo" : "Inativo"}</span>}
                checked={servico.ativo}
                disabled={ocupado === servico.id}
                onChange={() => alternarAtivo(servico)}
                aria-label={`${servico.nome}: aparece na página de agendamento`}
              />
              <div className="flex">
                <BotaoIcone icone="lapis" rotulo={`Editar ${servico.nome}`} onClick={() => setEditando(servico)} />
                <BotaoIcone icone="lixeira" rotulo={`Excluir ${servico.nome}`} onClick={() => setExcluindo(servico)} className="text-erro hover:bg-erro-fundo hover:text-erro" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Janela aberta={editando !== null} aoFechar={() => setEditando(null)} titulo={editando === "novo" ? "Novo serviço" : "Editar serviço"}>
        {editando !== null && (
          <FormularioServico
            key={editando === "novo" ? "novo" : editando.id}
            servico={editando === "novo" ? null : editando}
            aoSalvar={salvo}
            aoCancelar={() => setEditando(null)}
          />
        )}
      </Janela>

      <Janela
        aberta={excluindo !== null}
        aoFechar={fecharExclusao}
        titulo={`Excluir ${excluindo?.nome ?? "serviço"}?`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={fecharExclusao}>
              Voltar
            </Botao>
            {erroAoExcluir && excluindo?.ativo ? (
              <Botao
                variante="secundario"
                onClick={async () => {
                  const servico = excluindo;
                  fecharExclusao();
                  await alternarAtivo(servico);
                }}
              >
                Desativar
              </Botao>
            ) : (
              !erroAoExcluir && (
                <Botao variante="perigo" icone="lixeira" onClick={excluir}>
                  Excluir
                </Botao>
              )
            )}
          </>
        }
      >
        {erroAoExcluir ? (
          <Aviso tipo="atencao" titulo="Esse serviço tem histórico" papel="alert">
            <p>{erroAoExcluir}</p>
          </Aviso>
        ) : (
          <p>O serviço some da página de agendamento e da lista. Essa ação não pode ser desfeita.</p>
        )}
      </Janela>
    </main>
  );
}
