import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** Buscadores podem ler as páginas públicas; painel e confirmações ficam de fora. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/painel", "/entrar", "/cadastro", "/*/confirmado/"] },
    host: SITE_URL,
  };
}
