import type { Metadata } from "next";

import { Logo } from "@/componentes/Logo";

export const metadata: Metadata = {
  title: "Como seus dados são usados",
  description: "Quais dados o Agenda Fácil guarda quando você marca um horário, quem vê e para quê.",
};

// TODO(Beatriz): antes de ter clientes de verdade, revisar este texto com alguém que entenda de LGPD
// e definir por quanto tempo os agendamentos antigos ficam guardados.

export default function Privacidade() {
  return (
    <>
      <header className="border-b border-linha bg-superficie">
        <div className="mx-auto flex max-w-cliente items-center px-4 py-3">
          <Logo />
        </div>
      </header>
      <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 py-10">
        <h1>Como seus dados são usados</h1>
        <p className="text-tinta-suave">
          Este texto descreve o que o Agenda Fácil faz hoje, nesta versão. Não é um texto jurídico revisado.
        </p>

        <section className="grid gap-2">
          <h2>Quando você marca um horário</h2>
          <ul className="grid list-disc gap-1 pl-5">
            <li>Guardamos seu nome, seu WhatsApp, o serviço, o dia e o horário escolhidos.</li>
            <li>Quem vê esses dados é só o negócio em que você marcou, no painel dele.</li>
            <li>O uso é um só: organizar a agenda e falar com você sobre este horário.</li>
            <li>Não pedimos CPF, e-mail nem senha, e não vendemos nem compartilhamos seus dados com mais ninguém.</li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2>Cookies</h2>
          <p>
            A página de agendamento não usa cookies de propaganda nem de estatística. O único cookie do site é o de login do
            painel, usado por quem cuida do negócio.
          </p>
        </section>

        <section className="grid gap-2">
          <h2>Para corrigir ou apagar seus dados</h2>
          <p>Fale com o negócio pelo WhatsApp que aparece na página de agendamento. Ele consegue cancelar o horário no painel.</p>
        </section>
      </main>
    </>
  );
}
