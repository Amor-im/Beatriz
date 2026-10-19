import type { Metadata } from "next";

import { TelaHorarios } from "@/componentes/painel/horarios/TelaHorarios";

export const metadata: Metadata = { title: "Horários" };

export default function PaginaHorarios() {
  return <TelaHorarios />;
}
