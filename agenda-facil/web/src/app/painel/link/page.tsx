import type { Metadata } from "next";

import { TelaMeuLink } from "@/componentes/painel/link/TelaMeuLink";

export const metadata: Metadata = { title: "Meu link" };

export default function PaginaMeuLink() {
  return <TelaMeuLink />;
}
