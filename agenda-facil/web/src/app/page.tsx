import type { Metadata } from "next";

import { LinkBotao } from "@/componentes/Botao";
import { Logo } from "@/componentes/Logo";

export const metadata: Metadata = {
  title: { absolute: "Agenda Fácil · agendamento online para pequenos negócios" },
};

const passos = [
  { titulo: "Cadastre serviços e horários", texto: "Nome, duração e preço de cada serviço, os dias em que você atende e a pausa do almoço." },
  { titulo: "Compartilhe seu link", texto: "O cliente escolhe serviço, dia e horário pelo celular, sem criar conta e sem baixar app." },
  { titulo: "Acompanhe a agenda", texto: "Os agendamentos chegam no painel. Confirme, cancele ou bloqueie um horário quando precisar." },
];

export default function Inicio() {
  return (
    <>
      <header className="border-b border-linha bg-superficie">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <LinkBotao href="/entrar" variante="fantasma">
            Entrar
          </LinkBotao>
        </div>
      </header>
      <main id="conteudo" className="mx-auto grid max-w-5xl gap-12 px-4 py-12 md:py-20">
        <section className="grid max-w-2xl gap-6">
          <h1 className="text-[2.25rem] leading-[1.1] md:text-[3rem]">
            O cliente marca pelo link. <span className="bg-marca-texto px-1">Sem horário duplicado.</span>
          </h1>
          <p className="text-h3 text-tinta-suave">
            Agenda online para salão, barbearia, estúdio e outros negócios de serviço. Os horários livres são calculados a
            partir do seu expediente e dos agendamentos que já existem.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkBotao href="/cadastro">Criar minha agenda</LinkBotao>
            <LinkBotao href="/entrar" variante="secundario">
              Já tenho conta
            </LinkBotao>
          </div>
        </section>
        <section aria-labelledby="como-funciona" className="grid gap-6">
          <h2 id="como-funciona">Como funciona</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {passos.map((passo, i) => (
              <li key={passo.titulo} className="grid content-start gap-2 rounded-m border-[1.5px] border-linha bg-superficie p-6 shadow-1">
                <span className="font-hora text-pequeno font-semibold text-caneta">Passo {i + 1}</span>
                <h3 className="text-h3 font-bold">{passo.titulo}</h3>
                <p className="text-tinta-suave">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
