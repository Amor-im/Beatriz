import { z } from "zod";

import { soDigitos } from "./formatos";

// Regras dos formulários. São as mesmas da API (Bean Validation): o front valida para
// responder rápido, mas quem decide de verdade é sempre o servidor.

const whatsapp = z
  .string()
  .refine((valor) => [10, 11].includes(soDigitos(valor).length), "Informe o WhatsApp com DDD, por exemplo (11) 98765-4321.");

export const esquemaDadosDoCliente = z.object({
  clienteNome: z
    .string()
    .trim()
    .min(2, "Informe seu nome (pelo menos 2 letras).")
    .max(80, "O nome pode ter até 80 caracteres."),
  clienteWhatsapp: whatsapp,
});
export type DadosDoCliente = z.infer<typeof esquemaDadosDoCliente>;

export const esquemaEntrar = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").pipe(z.email("Confira o e-mail, parece que falta alguma parte.")),
  senha: z.string().min(1, "Informe sua senha."),
});
export type DadosDeEntrar = z.infer<typeof esquemaEntrar>;

const slug = z
  .string()
  .trim()
  .min(3, "Use pelo menos 3 caracteres.")
  .max(40, "Use até 40 caracteres.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use só letras minúsculas sem acento, números e hífen (ex.: studio-da-ana).");

export const esquemaNegocio = z.object({
  nome: z.string().trim().min(2, "Informe o nome do negócio.").max(80, "O nome pode ter até 80 caracteres."),
  slug,
  whatsapp,
  endereco: z.string().trim().max(160, "O endereço pode ter até 160 caracteres."),
});
export type DadosDoNegocio = z.infer<typeof esquemaNegocio>;

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(80, "O nome pode ter até 80 caracteres."),
  email: z.string().trim().min(1, "Informe seu e-mail.").pipe(z.email("Confira o e-mail, parece que falta alguma parte.")),
  senha: z.string().min(12, "Use pelo menos 12 caracteres. Uma frase curta fica fácil de lembrar.").max(72, "Use até 72 caracteres."),
  negocio: esquemaNegocio,
});
export type DadosDeCadastro = z.infer<typeof esquemaCadastro>;

export const esquemaServico = z.object({
  nome: z.string().trim().min(2, "Informe o nome do serviço.").max(60, "O nome pode ter até 60 caracteres."),
  duracaoMinutos: z.string().min(1, "Escolha a duração."),
  preco: z
    .string()
    .trim()
    .regex(/^(\d{1,6}([,.]\d{1,2})?)?$/, "Use só números, por exemplo 45 ou 45,50."),
  ativo: z.boolean(),
});
export type DadosDoServico = z.infer<typeof esquemaServico>;

/** "45,50" → 4550; "" → null. */
export function precoEmCentavos(preco: string): number | null {
  if (!preco.trim()) return null;
  return Math.round(Number(preco.replace(",", ".")) * 100);
}
