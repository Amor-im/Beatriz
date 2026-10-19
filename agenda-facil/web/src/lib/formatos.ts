// Formatação de valores para a tela, sempre em português do Brasil.

const FUSO_DO_NEGOCIO = "America/Sao_Paulo";

/** 4500 → "R$ 45"; 4550 → "R$ 45,50". */
export function formatarPreco(centavos: number | null): string | null {
  if (centavos === null) return null;
  const inteiro = centavos % 100 === 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: inteiro ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(centavos / 100)
    .replace(/\u00a0/g, " ");
}

/** 40 → "40 min"; 60 → "1 h"; 70 → "1 h 10 min". */
export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** "2026-10-20" vira uma data ao meio-dia em UTC: assim o fuso do navegador não muda o dia. */
function comoData(data: string): Date {
  return new Date(`${data}T12:00:00Z`);
}

function formatar(data: string, opcoes: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", { ...opcoes, timeZone: "UTC" }).format(comoData(data));
}

/** "terça-feira" */
export const diaDaSemana = (data: string) => formatar(data, { weekday: "long" });
/** "TER" */
export const diaDaSemanaCurto = (data: string) => formatar(data, { weekday: "short" }).replace(".", "").toUpperCase();
/** "20 de outubro" */
export const diaEMes = (data: string) => formatar(data, { day: "numeric", month: "long" });
/** "20" */
export const diaDoMes = (data: string) => formatar(data, { day: "numeric" });
/** "terça-feira, 20 de outubro" */
export const dataPorExtenso = (data: string) => `${diaDaSemana(data)}, ${diaEMes(data)}`;
/** "ter, 20/10" */
export const dataCurta = (data: string) =>
  formatar(data, { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");

/** Hoje no fuso do negócio, no formato "2026-10-20". */
export function hoje(): string {
  // o formato en-CA já sai como AAAA-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_DO_NEGOCIO }).format(new Date());
}

/** "2026-10-20" + 1 → "2026-10-21". */
export function somarDias(data: string, dias: number): string {
  const nova = comoData(data);
  nova.setUTCDate(nova.getUTCDate() + dias);
  return nova.toISOString().slice(0, 10);
}

/** Segunda-feira da semana da data. */
export function inicioDaSemana(data: string): string {
  const diaDaSemanaIso = ((comoData(data).getUTCDay() + 6) % 7) + 1; // 1 = segunda
  return somarDias(data, 1 - diaDaSemanaIso);
}

/** Manhã (antes das 12h), Tarde (até 18h) ou Noite. */
export function periodoDoDia(horario: string): "Manhã" | "Tarde" | "Noite" {
  const hora = Number(horario.slice(0, 2));
  if (hora < 12) return "Manhã";
  if (hora < 18) return "Tarde";
  return "Noite";
}

/** Só os números: "(11) 98765-4321" → "11987654321". */
export const soDigitos = (texto: string) => texto.replace(/\D/g, "");

/** Máscara enquanto digita: "11987654321" → "(11) 98765-4321". */
export function mascararWhatsapp(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Link do WhatsApp com a mensagem já escrita. O número vem com DDD; 55 é o código do Brasil. */
export function linkWhatsapp(numero: string, mensagem: string): string {
  return `https://wa.me/55${soDigitos(numero)}?text=${encodeURIComponent(mensagem)}`;
}

/** "09:40" → 580 (minutos desde a meia-noite). */
export function emMinutos(horario: string): number {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

/** 580 → "09:40". */
export function deMinutos(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

/** "Studio da Ana" → "studio-da-ana" (sugestão de endereço do link). */
export function sugerirSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
