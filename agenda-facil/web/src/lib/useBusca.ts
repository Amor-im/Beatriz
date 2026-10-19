"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ErroDaApi } from "./api";

type Estado<T> = { chave: string | null; caminho: string | null; dados?: T; erro?: ErroDaApi };

/**
 * Busca dados da API quando o caminho muda e devolve os 3 estados da tela:
 * carregando, erro e dados. "recarregar" busca de novo (depois de salvar, por exemplo).
 * Enquanto recarrega o mesmo caminho, os dados antigos continuam na tela.
 */
export function useBusca<T>(caminho: string | null) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState<Estado<T>>({ chave: null, caminho: null });
  const chave = caminho === null ? null : `${caminho}#${versao}`;

  useEffect(() => {
    if (caminho === null || chave === null) return;
    let ativo = true;
    api<T>(caminho).then(
      (dados) => ativo && setEstado({ chave, caminho, dados }),
      (erro: unknown) =>
        ativo &&
        setEstado({
          chave,
          caminho,
          erro: erro instanceof ErroDaApi ? erro : new ErroDaApi(0, "Algo deu errado. Tente de novo."),
        }),
    );
    return () => {
      ativo = false;
    };
  }, [caminho, chave]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  const doMesmoCaminho = estado.caminho === caminho;

  return {
    dados: doMesmoCaminho ? estado.dados : undefined,
    erro: estado.chave === chave ? estado.erro : undefined,
    carregando: caminho !== null && estado.chave !== chave,
    recarregar,
  };
}
