import type { Metadata } from "next";

import { TelaServicos } from "@/componentes/painel/servicos/TelaServicos";

export const metadata: Metadata = { title: "Serviços" };

export default function PaginaServicos() {
  return <TelaServicos />;
}
