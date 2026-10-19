/** Endereço do site (usado para montar o link público que o dono compartilha). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** "http://localhost:3000/studio-da-ana" sem o "http://" para mostrar na tela. */
export const linkPublico = (slug: string) => `${SITE_URL}/${slug}`;
export const linkPublicoSemProtocolo = (slug: string) => linkPublico(slug).replace(/^https?:\/\//, "");

/** Só aceita voltar para uma página do painel (evita mandar alguém para outro site depois do login). */
export function destinoSeguro(voltar: string | null): string {
  return voltar && /^\/painel(\/[a-z-]*)?$/.test(voltar) ? voltar : "/painel";
}
