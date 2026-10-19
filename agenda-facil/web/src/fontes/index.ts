import localFont from "next/font/local";

// As mesmas fontes do design system (Parte 1), servidas pelo próprio site:
// sem pedido extra para o Google e sem texto "pulando" quando a fonte carrega.

/** Títulos: Gabarito. */
export const fonteTitulo = localFont({
  src: [
    { path: "./gabarito-latin-700-normal.woff2", weight: "700" },
    { path: "./gabarito-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--fonte-gabarito",
  display: "swap",
});

/** Texto: Atkinson Hyperlegible Next, feita para leitura fácil. */
export const fonteTexto = localFont({
  src: [
    { path: "./atkinson-hyperlegible-next-latin-400-normal.woff2", weight: "400" },
    { path: "./atkinson-hyperlegible-next-latin-600-normal.woff2", weight: "600" },
    { path: "./atkinson-hyperlegible-next-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--fonte-atkinson",
  display: "swap",
});

/** Horários: a versão mono, para os números ficarem alinhados (09:00 embaixo de 10:20). */
export const fonteHora = localFont({
  src: [
    { path: "./atkinson-hyperlegible-mono-latin-500-normal.woff2", weight: "500" },
    { path: "./atkinson-hyperlegible-mono-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--fonte-atkinson-mono",
  display: "swap",
  preload: false,
});
