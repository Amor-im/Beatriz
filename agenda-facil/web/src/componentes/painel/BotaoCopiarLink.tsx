"use client";

import { Botao } from "@/componentes/Botao";
import { useToast } from "@/componentes/Toast";
import { linkPublico } from "@/lib/site";

/** Copia o link público para a área de transferência e avisa com um toast. */
export function BotaoCopiarLink({ slug, variante = "principal" }: { slug: string; variante?: "principal" | "secundario" }) {
  const mostrarToast = useToast();
  async function copiar() {
    try {
      await navigator.clipboard.writeText(linkPublico(slug));
      mostrarToast("Link copiado. Cole no WhatsApp ou no Instagram.");
    } catch {
      mostrarToast("Não deu para copiar automaticamente. Selecione o link e copie.", "erro");
    }
  }
  return (
    <Botao variante={variante} icone="copiar" onClick={copiar}>
      Copiar link
    </Botao>
  );
}
