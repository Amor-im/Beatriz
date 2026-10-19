import { useId, type ComponentProps, type ReactNode } from "react";

import { Icone } from "./Icone";

export const classesDaEntrada =
  "w-full min-h-alvo rounded-p border-[1.5px] border-linha-forte bg-superficie px-4 py-2 text-corpo " +
  "placeholder:text-tinta-dica hover:border-tinta-suave focus-visible:border-caneta focus-visible:outline-offset-1 " +
  "transition-colors duration-[120ms] " +
  "disabled:cursor-not-allowed disabled:border-dashed disabled:bg-papel disabled:text-tinta-suave " +
  "aria-[invalid=true]:border-2 aria-[invalid=true]:border-erro aria-[invalid=true]:bg-[#fffafa]";

/**
 * Rótulo + dica + entrada + erro, ligados por id (o leitor de tela lê tudo junto).
 * O rótulo fica sempre visível: placeholder não substitui rótulo.
 */
export function Campo({
  rotulo,
  dica,
  erro,
  opcional = false,
  children,
}: {
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
  opcional?: boolean;
  /** Recebe os ids para colocar na entrada. */
  children: (ids: { id: string; "aria-describedby"?: string; "aria-invalid": boolean }) => ReactNode;
}) {
  const id = useId();
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;
  const descricao = [dica ? idDica : null, erro ? idErro : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-bold">
        {rotulo} {opcional && <span className="font-normal text-tinta-suave">(opcional)</span>}
      </label>
      {dica && (
        <p id={idDica} className="text-pequeno text-tinta-suave">
          {dica}
        </p>
      )}
      {children({ id, "aria-describedby": descricao, "aria-invalid": Boolean(erro) })}
      {erro && (
        <p id={idErro} className="flex items-start gap-2 text-pequeno font-semibold text-erro">
          <Icone nome="alerta" className="mt-px size-[1.1em]" />
          {erro}
        </p>
      )}
    </div>
  );
}

export function Entrada({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${classesDaEntrada} ${className}`} {...props} />;
}

export function Selecao({ className = "", ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`${classesDaEntrada} appearance-none bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-12 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23131a2e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
      }}
      {...props}
    />
  );
}

/** Interruptor (aberto/fechado, ativo/inativo). É um checkbox de verdade, com texto ao lado. */
export function Interruptor({ rotulo, className = "", ...props }: ComponentProps<"input"> & { rotulo: ReactNode }) {
  return (
    <label className={`inline-flex min-h-alvo cursor-pointer items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        className="relative h-[26px] w-11 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-linha-forte bg-superficie transition-colors duration-[120ms] after:absolute after:left-[3px] after:top-[3px] after:size-4 after:rounded-full after:bg-linha-forte after:transition-transform after:duration-[120ms] checked:border-caneta checked:bg-caneta checked:after:translate-x-[18px] checked:after:bg-white"
        {...props}
      />
      {rotulo}
    </label>
  );
}
