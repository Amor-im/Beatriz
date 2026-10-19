import type { Metadata } from "next";

import { FormularioCadastro } from "@/componentes/conta/FormularioCadastro";
import { MolduraDaConta } from "@/componentes/conta/MolduraDaConta";

export const metadata: Metadata = { title: "Criar minha agenda" };

export default function PaginaCadastro() {
  return (
    <MolduraDaConta titulo="Criar minha agenda" subtitulo="Depois você cadastra os serviços e ajusta os horários. Leva poucos minutos.">
      <FormularioCadastro />
    </MolduraDaConta>
  );
}
