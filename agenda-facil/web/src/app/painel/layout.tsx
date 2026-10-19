import type { Metadata } from "next";
import { Suspense } from "react";

import { ShellDoPainel } from "@/componentes/painel/ShellDoPainel";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function LayoutDoPainel({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ShellDoPainel>{children}</ShellDoPainel>
    </Suspense>
  );
}
