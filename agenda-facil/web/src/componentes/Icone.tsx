// Ícones em SVG no traço dos conjuntos Feather (MIT) e Lucide (ISC), os mesmos da Parte 1.
// A cor vem de currentColor: o ícone segue a cor do texto ao lado.

const desenhos = {
  check: <polyline points="20 6 9 17 4 12" />,
  "chevron-esquerda": <polyline points="15 18 9 12 15 6" />,
  "chevron-direita": <polyline points="9 18 15 12 9 6" />,
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  local: (
    <>
      <path d="M12 21.5s-7-6-7-11.5a7 7 0 0 1 14 0c0 5.5-7 11.5-7 11.5z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3.5" y1="10.5" x2="20.5" y2="10.5" />
    </>
  ),
  mensagem: <path d="M20.5 11.6a8.4 8.4 0 0 1-12.2 7.5L3.5 20.5l1.4-4.5a8.4 8.4 0 1 1 15.6-4.4z" />,
  copiar: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  mais: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  alerta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" />
      <line x1="12" y1="16.2" x2="12" y2="16.3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.7" x2="12" y2="7.8" />
    </>
  ),
  tesoura: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.1" y2="15.9" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" />
      <line x1="8.1" y1="8.1" x2="12" y2="12" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 10.5a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </>
  ),
  sair: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  olho: (
    <>
      <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "olho-fechado": (
    <>
      <path d="M17.9 17.9A10 10 0 0 1 12 19.5C5.5 19.5 1.5 12 1.5 12a18 18 0 0 1 4.6-5.9" />
      <path d="M9.9 4.7A9 9 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a18 18 0 0 1-2.2 3.2" />
      <line x1="1.5" y1="1.5" x2="22.5" y2="22.5" />
    </>
  ),
  lapis: <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  lixeira: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  "abrir-externo": (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
} as const;

export type NomeDoIcone = keyof typeof desenhos;

/** Tamanho padrão de 20px; passe uma classe size-* para mudar. */
export function Icone({ nome, className = "" }: { nome: NomeDoIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className.includes("size-") ? "" : "size-5"} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {desenhos[nome]}
    </svg>
  );
}
