"use client";

import { EstadoErro } from "@/componentes/Estados";

/** Erro inesperado numa página (API fora do ar, por exemplo). */
export default function ErroDaPagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 py-16">
      <EstadoErro mensagem="O servidor não respondeu como esperado. Espere alguns segundos e tente de novo." aoTentarDeNovo={reset} />
    </main>
  );
}
