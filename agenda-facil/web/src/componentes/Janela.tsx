"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { BotaoIcone } from "./Botao";

/**
 * Janela (modal) com o <dialog> nativo do navegador: ele já prende o foco dentro,
 * fecha com Esc e devolve o foco para quem abriu.
 */
export function Janela({
  aberta,
  aoFechar,
  titulo,
  children,
  rodape,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const janela = ref.current;
    if (!janela) return;
    if (aberta && !janela.open) janela.showModal();
    if (!aberta && janela.open) janela.close();
  }, [aberta]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      aria-labelledby="titulo-da-janela"
      className="m-auto w-[min(calc(100%-32px),520px)] rounded-g bg-superficie p-0 text-tinta shadow-2 backdrop:bg-tinta/45 focus:outline-none"
    >
      {aberta && (
        <>
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <h2 id="titulo-da-janela" className="text-h2">
              {titulo}
            </h2>
            <BotaoIcone icone="x" rotulo="Fechar" className="-mr-3 -mt-3" onClick={aoFechar} />
          </div>
          <div className="px-6 py-4">{children}</div>
          {rodape && <div className="flex flex-wrap justify-end gap-2 px-6 pb-6 pt-2">{rodape}</div>}
        </>
      )}
    </dialog>
  );
}
