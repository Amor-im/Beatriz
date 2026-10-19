import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Icone, type NomeDoIcone } from "./Icone";

type Variante = "principal" | "secundario" | "fantasma" | "perigo";

const estilos: Record<Variante, string> = {
  principal: "border-caneta bg-caneta text-white hover:border-caneta-escura hover:bg-caneta-escura hover:text-white",
  secundario: "border-caneta bg-superficie text-caneta hover:bg-caneta-clara hover:text-caneta-escura",
  fantasma: "border-transparent bg-transparent px-4 text-caneta hover:bg-caneta-clara hover:text-caneta-escura",
  perigo: "border-erro bg-superficie text-erro hover:bg-erro-fundo hover:text-erro",
};

const base =
  "inline-flex min-h-alvo items-center justify-center gap-2 rounded-m border-2 px-6 font-bold no-underline " +
  "transition-colors duration-[120ms] cursor-pointer " +
  "disabled:cursor-not-allowed disabled:border-linha disabled:bg-papel disabled:text-tinta-dica";

export function classesDoBotao(variante: Variante = "principal", largo = false) {
  return `${base} ${estilos[variante]} ${largo ? "w-full" : ""}`;
}

type PropsDoBotao = ComponentProps<"button"> & {
  variante?: Variante;
  largo?: boolean;
  icone?: NomeDoIcone;
  /** Mostra o giro, troca o texto e desabilita: evita enviar duas vezes. */
  carregando?: boolean;
  textoCarregando?: string;
};

/** Botão do design system. Uma ação principal por tela; as outras são secundárias ou fantasma. */
export function Botao({
  variante = "principal",
  largo = false,
  icone,
  carregando = false,
  textoCarregando,
  children,
  className = "",
  disabled,
  type = "button",
  ...resto
}: PropsDoBotao) {
  return (
    <button
      type={type}
      className={`${classesDoBotao(variante, largo)} ${carregando ? "cursor-progress" : ""} ${className}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? (
        <span className="size-[1.1em] animate-girar rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      ) : (
        icone && <Icone nome={icone} />
      )}
      {carregando && textoCarregando ? textoCarregando : children}
    </button>
  );
}

/** Link com cara de botão (para navegação, não para ações). */
export function LinkBotao({
  href,
  variante = "principal",
  largo = false,
  icone,
  children,
  className = "",
  externo = false,
}: {
  href: string;
  variante?: Variante;
  largo?: boolean;
  icone?: NomeDoIcone;
  children: ReactNode;
  className?: string;
  /** Links para fora (WhatsApp, mapa, arquivo .ics) usam <a> comum. */
  externo?: boolean;
}) {
  const classes = `${classesDoBotao(variante, largo)} ${className}`;
  const conteudo = (
    <>
      {icone && <Icone nome={icone} />}
      {children}
    </>
  );
  if (externo) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {conteudo}
    </Link>
  );
}

/** Botão só de ícone: sempre com um rótulo para leitor de tela. */
export function BotaoIcone({
  icone,
  rotulo,
  className = "",
  ...resto
}: ComponentProps<"button"> & { icone: NomeDoIcone; rotulo: string }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={`inline-flex size-alvo items-center justify-center rounded-m text-tinta hover:bg-caneta-clara hover:text-caneta-escura disabled:cursor-not-allowed disabled:text-tinta-dica disabled:hover:bg-transparent ${className}`}
      {...resto}
    >
      <Icone nome={icone} />
    </button>
  );
}
