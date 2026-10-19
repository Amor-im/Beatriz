import type { ReactNode } from "react";

import { Logo } from "@/componentes/Logo";

/** Moldura das telas de entrar e criar conta. */
export function MolduraDaConta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: ReactNode; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-linha bg-superficie">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Logo />
        </div>
      </header>
      <main id="conteudo" className="mx-auto grid max-w-[560px] gap-6 px-4 py-10">
        <div className="grid gap-2">
          <h1>{titulo}</h1>
          {subtitulo && <p className="text-tinta-suave">{subtitulo}</p>}
        </div>
        <div className="rounded-g border-[1.5px] border-linha bg-superficie p-6 shadow-1 md:p-8">{children}</div>
      </main>
    </>
  );
}
