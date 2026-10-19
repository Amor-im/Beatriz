"use client";

import { forwardRef, useState, type ComponentProps } from "react";

import { classesDaEntrada } from "@/componentes/Campo";
import { Icone } from "@/componentes/Icone";

/** Campo de senha com botão para mostrar e esconder (ajuda quem digita no celular). */
export const CampoSenha = forwardRef<HTMLInputElement, Omit<ComponentProps<"input">, "type">>(function CampoSenha(
  { className = "", ...props },
  ref,
) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visivel ? "text" : "password"} className={`${classesDaEntrada} pr-14 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
        aria-pressed={visivel}
        className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-p text-tinta-suave hover:bg-caneta-clara hover:text-caneta-escura"
      >
        <Icone nome={visivel ? "olho-fechado" : "olho"} />
      </button>
    </div>
  );
});
