import type { APIRequestContext } from "@playwright/test";

/** Endereço da API (a mesma do front). */
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const SLUG = "studio-exemplo";
export const PASTA_DOS_PRINTS = "../docs/screens";

type Dia = { data: string; situacao: string; livres: number };

/** Acha um horário livre (a partir de amanhã) direto na API, para o teste não depender do dia em que roda. */
export async function horarioLivre(request: APIRequestContext, nomeDoServico = "Corte", posicao = 1) {
  const negocio = await (await request.get(`${API}/api/publico/negocios/${SLUG}`)).json();
  const servico = negocio.servicos.find((s: { nome: string }) => s.nome === nomeDoServico);
  const dias: Dia[] = await (await request.get(`${API}/api/publico/negocios/${SLUG}/dias?servicoId=${servico.id}`)).json();
  const dia = dias.slice(1).find((d) => d.situacao === "LIVRE" && d.livres > posicao + 1);
  if (!dia) throw new Error("Não há dia com horários livres nas próximas duas semanas. Reinicie a API para recriar o seed.");
  const { horarios } = await (
    await request.get(`${API}/api/publico/negocios/${SLUG}/horarios?servicoId=${servico.id}&data=${dia.data}`)
  ).json();
  return { servicoId: servico.id as number, data: dia.data, horario: horarios[posicao] as string };
}
