import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Esqueleto } from "@/componentes/Estados";
import { FluxoDeAgendamento } from "@/componentes/publico/FluxoDeAgendamento";
import { apiPublica, ErroDaApi } from "@/lib/api";

/** Busca o negócio no servidor; null quando o link não existe. */
async function buscarNegocio(slug: string) {
  try {
    return await apiPublica.negocio(slug);
  } catch (erro) {
    if (erro instanceof ErroDaApi && erro.status === 404) return null;
    throw erro;
  }
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const negocio = await buscarNegocio(slug);
  if (!negocio) return { title: "Página não encontrada" };
  return {
    title: `Agendar em ${negocio.nome}`,
    description: `Escolha o serviço, o dia e o horário em ${negocio.nome}. Sem criar conta.`,
  };
}

/**
 * Página pública do negócio (agendafacil.com/<slug>).
 * O negócio e os serviços vêm do servidor já na primeira resposta (bom para celular com internet lenta);
 * o resto do fluxo roda no navegador.
 */
export default function PaginaDoNegocio({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<EsqueletoDaPagina />}>
      <ConteudoDoNegocio params={params} />
    </Suspense>
  );
}

async function ConteudoDoNegocio({ params }: { params: PageProps<"/[slug]">["params"] }) {
  const { slug } = await params;
  const negocio = await buscarNegocio(slug);
  if (!negocio) notFound();
  return <FluxoDeAgendamento negocio={negocio} />;
}

function EsqueletoDaPagina() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando a página de agendamento…</span>
      <div className="border-b border-linha bg-superficie">
        <div className="mx-auto grid max-w-cliente gap-4 px-4 py-8">
          <div className="flex items-center gap-4">
            <Esqueleto className="size-16 rounded-m" />
            <Esqueleto className="h-8 w-48" />
          </div>
          <Esqueleto className="h-4 w-56" />
          <Esqueleto className="h-1.5 w-full" />
        </div>
      </div>
      <div className="mx-auto grid max-w-cliente gap-2 px-4 pt-8">
        <Esqueleto className="mb-4 h-7 w-52" />
        {Array.from({ length: 4 }, (_, i) => (
          <Esqueleto key={i} className="h-[72px] rounded-m" />
        ))}
      </div>
    </div>
  );
}
