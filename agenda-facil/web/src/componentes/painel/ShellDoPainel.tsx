"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Esqueleto, EstadoErro } from "@/componentes/Estados";
import { Icone, type NomeDoIcone } from "@/componentes/Icone";
import { Logo } from "@/componentes/Logo";
import { ProvedorDeToast } from "@/componentes/Toast";
import { apiPainel } from "@/lib/api";
import type { Sessao } from "@/lib/tipos";
import { useBusca } from "@/lib/useBusca";

import { ContextoSessao } from "./Sessao";

const areas: { href: string; rotulo: string; icone: NomeDoIcone }[] = [
  { href: "/painel", rotulo: "Agenda", icone: "calendario" },
  { href: "/painel/servicos", rotulo: "Serviços", icone: "tesoura" },
  { href: "/painel/horarios", rotulo: "Horários", icone: "relogio" },
  { href: "/painel/link", rotulo: "Meu link", icone: "link" },
];

/**
 * Moldura do painel: menu lateral no computador e barra inferior no celular.
 * Carrega a sessão uma vez; se o login venceu, limpa o cookie e volta para "Entrar".
 */
export function ShellDoPainel({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessao = useBusca<Sessao>("/api/auth/eu");
  const naoAutenticado = sessao.erro?.status === 401;

  useEffect(() => {
    if (!naoAutenticado) return;
    apiPainel
      .sair()
      .catch(() => undefined)
      .finally(() => router.replace(`/entrar?voltar=${encodeURIComponent(pathname)}`));
  }, [naoAutenticado, pathname, router]);

  async function sair() {
    await apiPainel.sair().catch(() => undefined);
    router.replace("/entrar");
  }

  if (sessao.erro && !naoAutenticado) {
    return (
      <main id="conteudo" className="mx-auto max-w-cliente px-4 py-16">
        <EstadoErro mensagem={sessao.erro.message} aoTentarDeNovo={sessao.recarregar} />
      </main>
    );
  }

  if (!sessao.dados) {
    return (
      <div role="status" className="lg:grid lg:min-h-dvh lg:grid-cols-[248px_1fr]">
        <span className="sr-only">Carregando o painel…</span>
        <div className="hidden border-r border-linha bg-superficie p-6 lg:grid lg:content-start lg:gap-4">
          <Esqueleto className="h-8 w-36" />
          <Esqueleto className="h-alvo" />
          <Esqueleto className="h-alvo" />
          <Esqueleto className="h-alvo" />
        </div>
        <div className="grid content-start gap-4 p-4 lg:p-8">
          <Esqueleto className="h-9 w-40" />
          <Esqueleto className="h-[60vh] rounded-m" />
        </div>
      </div>
    );
  }

  const { negocio, nome } = sessao.dados;
  const ativa = (href: string) => (href === "/painel" ? pathname === "/painel" : pathname.startsWith(href));

  return (
    <ContextoSessao.Provider value={{ sessao: sessao.dados, recarregarSessao: sessao.recarregar }}>
      <ProvedorDeToast>
        <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
          {/* Computador: menu lateral */}
          <aside className="hidden border-r border-linha bg-superficie lg:block">
            <div className="sticky top-0 flex h-dvh flex-col p-4">
              <div className="px-2 pb-4 pt-2">
                <Logo href="/painel" />
              </div>
              <nav aria-label="Painel" className="grid gap-1">
                {areas.map((area) => (
                  <Link
                    key={area.href}
                    href={area.href}
                    aria-current={ativa(area.href) ? "page" : undefined}
                    className="flex min-h-alvo items-center gap-3 rounded-m px-4 font-semibold text-tinta no-underline hover:bg-caneta-clara hover:text-caneta-escura aria-[current=page]:bg-caneta aria-[current=page]:text-white"
                  >
                    <Icone nome={area.icone} />
                    {area.rotulo}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 border-t border-linha pt-4">
                <div className="px-2">
                  <p className="font-bold">{negocio.nome}</p>
                  <p className="text-pequeno text-tinta-suave">{nome}</p>
                </div>
                <button
                  type="button"
                  onClick={sair}
                  className="flex min-h-alvo items-center gap-3 rounded-m px-4 font-semibold text-tinta hover:bg-caneta-clara hover:text-caneta-escura"
                >
                  <Icone nome="sair" />
                  Sair
                </button>
              </div>
            </div>
          </aside>

          {/* Celular: barra de cima */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-linha bg-superficie px-4 py-1 lg:hidden">
            <Logo href="/painel" tamanho="text-[1.125rem]" />
            <button
              type="button"
              onClick={sair}
              className="inline-flex min-h-11 items-center gap-2 rounded-p px-3 font-semibold text-tinta hover:bg-caneta-clara"
            >
              <Icone nome="sair" />
              Sair
            </button>
          </header>

          <div className="min-w-0 pb-24 lg:pb-0">{children}</div>

          {/* Celular: barra de baixo */}
          <nav
            aria-label="Painel"
            className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-linha bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
          >
            {areas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                aria-current={ativa(area.href) ? "page" : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.8125rem] font-semibold text-tinta-suave no-underline aria-[current=page]:text-caneta"
              >
                <Icone nome={area.icone} />
                {area.rotulo}
              </Link>
            ))}
          </nav>
        </div>
      </ProvedorDeToast>
    </ContextoSessao.Provider>
  );
}
