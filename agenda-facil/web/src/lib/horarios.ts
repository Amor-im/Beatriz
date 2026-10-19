import { deMinutos } from "./formatos";

/** Opções de horário para os seletores: "05:00", "05:15" ... "23:45". */
export function opcoesDeHorario(passoMinutos = 15, de = 5 * 60, ate = 23 * 60 + 45): string[] {
  const opcoes: string[] = [];
  for (let minuto = de; minuto <= ate; minuto += passoMinutos) opcoes.push(deMinutos(minuto));
  return opcoes;
}

export const NOMES_DOS_DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
