import { NextResponse, type NextRequest } from "next/server";

/**
 * Antes de abrir o painel, confere se existe o cookie de sessão.
 * É só um atalho de experiência (manda para o login sem piscar a tela):
 * quem garante a segurança é a API, que valida o token em toda chamada.
 */
export function proxy(requisicao: NextRequest) {
  if (!requisicao.cookies.has("af_sessao")) {
    const entrar = new URL("/entrar", requisicao.url);
    entrar.searchParams.set("voltar", requisicao.nextUrl.pathname);
    return NextResponse.redirect(entrar);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
