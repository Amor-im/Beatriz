import type { Metadata, Viewport } from "next";

import { fonteHora, fonteTexto, fonteTitulo } from "@/fontes";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Agenda Fácil",
    template: "%s · Agenda Fácil",
  },
  description: "Agendamento online para pequenos negócios de serviço: o cliente marca pelo celular, sem criar conta.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6fa",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteTexto.variable} ${fonteHora.variable}`}>
      <body>
        <a
          href="#conteudo"
          className="absolute left-4 -top-24 z-50 inline-flex min-h-11 items-center rounded-p bg-superficie px-4 shadow-2 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
