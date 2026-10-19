"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { Icone } from "./Icone";

type Mensagem = { id: number; texto: string; tipo: "sucesso" | "erro" };

const ContextoToast = createContext<(texto: string, tipo?: Mensagem["tipo"]) => void>(() => {});

/** Mensagem curta depois de uma ação ("Agendamento confirmado"). Fica num role="status": o leitor de tela lê sozinho. */
export function ProvedorDeToast({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrar = useCallback((texto: string, tipo: Mensagem["tipo"] = "sucesso") => {
    clearTimeout(temporizador.current);
    setMensagem({ id: Date.now(), texto, tipo });
    temporizador.current = setTimeout(() => setMensagem(null), 5000);
  }, []);

  return (
    <ContextoToast.Provider value={mostrar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(calc(100%-32px),440px)] -translate-x-1/2"
      >
        {mensagem && (
          <div
            key={mensagem.id}
            className="pointer-events-auto flex min-h-14 items-center gap-4 rounded-m bg-tinta py-2 pl-4 pr-2 text-white shadow-2"
          >
            <Icone nome={mensagem.tipo === "sucesso" ? "check" : "alerta"} className={`size-5 ${mensagem.tipo === "sucesso" ? "text-[#9be2b7]" : "text-[#ffb4ab]"}`} />
            <span className="flex-1">{mensagem.texto}</span>
            <button
              type="button"
              onClick={() => setMensagem(null)}
              className="min-h-11 rounded-p px-4 font-bold text-marca-texto underline underline-offset-[3px] hover:bg-white/10"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </ContextoToast.Provider>
  );
}

export function useToast() {
  return useContext(ContextoToast);
}
