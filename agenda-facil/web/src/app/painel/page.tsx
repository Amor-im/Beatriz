import { Suspense } from "react";

import { TelaAgenda } from "@/componentes/painel/agenda/TelaAgenda";

export default function PaginaAgenda() {
  return (
    <Suspense>
      <TelaAgenda />
    </Suspense>
  );
}
