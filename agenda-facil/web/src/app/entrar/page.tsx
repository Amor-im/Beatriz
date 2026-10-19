import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioEntrar } from "@/componentes/conta/FormularioEntrar";
import { MolduraDaConta } from "@/componentes/conta/MolduraDaConta";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <MolduraDaConta titulo="Entrar" subtitulo="Acesse o painel da sua agenda.">
      <Suspense>
        <FormularioEntrar />
      </Suspense>
    </MolduraDaConta>
  );
}
