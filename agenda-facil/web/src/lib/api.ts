import type { Agendamento, AgendamentoPublico, Bloqueio, DiaDaSemana, Negocio, NegocioPublico, Servico, Sessao } from "./tipos";

/** Endereço da API usado pelo navegador (público: não é segredo, é só um endereço). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Endereço usado pelo servidor do Next. Em produção pode ser um endereço interno. */
const API_URL_SERVIDOR = process.env.API_URL ?? API_URL;

/** Erro no formato da API (ProblemDetail): a mensagem já vem pronta para mostrar na tela. */
export class ErroDaApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    /** Erros por campo, quando o servidor recusa um formulário: { "clienteNome": "Informe seu nome." } */
    public readonly erros: Record<string, string> = {},
    /** O corpo inteiro, para informações extras (ex.: horariosProximos no 409). */
    public readonly corpo: Record<string, unknown> = {},
  ) {
    super(mensagem);
    this.name = "ErroDaApi";
  }
}

type Opcoes = {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  corpo?: unknown;
};

/**
 * Chamada à API com o cookie de sessão (credentials: "include").
 * Toda resposta de erro vira ErroDaApi; falha de rede vira status 0.
 */
export async function api<T>(caminho: string, { metodo = "GET", corpo }: Opcoes = {}): Promise<T> {
  const base = typeof window === "undefined" ? API_URL_SERVIDOR : API_URL;
  let resposta: Response;
  try {
    resposta = await fetch(base + caminho, {
      method: metodo,
      headers: corpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ErroDaApi(0, "Não foi possível falar com o servidor. Confira sua internet e tente de novo.");
  }

  if (resposta.status === 204) {
    return undefined as T;
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const mensagem =
      typeof dados.detail === "string" ? dados.detail : "Algo deu errado. Tente de novo em instantes.";
    throw new ErroDaApi(resposta.status, mensagem, dados.erros ?? {}, dados);
  }
  return dados as T;
}

const slugSeguro = (slug: string) => encodeURIComponent(slug);

/** Rotas da página pública (cliente final, sem login). */
export const apiPublica = {
  negocio: (slug: string) => api<NegocioPublico>(`/api/publico/negocios/${slugSeguro(slug)}`),
  caminhoDias: (slug: string, servicoId: number) =>
    `/api/publico/negocios/${slugSeguro(slug)}/dias?servicoId=${servicoId}`,
  caminhoHorarios: (slug: string, servicoId: number, data: string) =>
    `/api/publico/negocios/${slugSeguro(slug)}/horarios?servicoId=${servicoId}&data=${data}`,
  agendar: (
    slug: string,
    dados: { servicoId: number; data: string; horario: string; clienteNome: string; clienteWhatsapp: string },
  ) => api<AgendamentoPublico>(`/api/publico/negocios/${slugSeguro(slug)}/agendamentos`, { metodo: "POST", corpo: dados }),
  agendamento: (codigo: string) => api<AgendamentoPublico>(`/api/publico/agendamentos/${encodeURIComponent(codigo)}`),
  linkCalendario: (codigo: string) => `${API_URL}/api/publico/agendamentos/${encodeURIComponent(codigo)}/calendario.ics`,
};

/** Rotas do painel do dono (exigem login). */
export const apiPainel = {
  cadastrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    negocio: { nome: string; slug: string; whatsapp: string; endereco?: string };
  }) => api<Sessao>("/api/auth/cadastro", { metodo: "POST", corpo: dados }),
  entrar: (dados: { email: string; senha: string }) => api<Sessao>("/api/auth/entrar", { metodo: "POST", corpo: dados }),
  sair: () => api<void>("/api/auth/sair", { metodo: "POST" }),
  sessao: () => api<Sessao>("/api/auth/eu"),

  salvarNegocio: (dados: { nome: string; slug: string; whatsapp: string; endereco?: string }) =>
    api<Negocio>("/api/negocio", { metodo: "PUT", corpo: dados }),

  caminhoServicos: "/api/servicos",
  criarServico: (dados: Omit<Servico, "id">) => api<Servico>("/api/servicos", { metodo: "POST", corpo: dados }),
  salvarServico: (id: number, dados: Omit<Servico, "id">) =>
    api<Servico>(`/api/servicos/${id}`, { metodo: "PUT", corpo: dados }),
  excluirServico: (id: number) => api<void>(`/api/servicos/${id}`, { metodo: "DELETE" }),

  caminhoHorarios: "/api/horarios",
  salvarHorarios: (dias: DiaDaSemana[]) => api<DiaDaSemana[]>("/api/horarios", { metodo: "PUT", corpo: { dias } }),

  caminhoBloqueios: "/api/bloqueios",
  criarBloqueio: (dados: { data: string; diaInteiro: boolean; inicio?: string; fim?: string; motivo?: string }) =>
    api<Bloqueio>("/api/bloqueios", { metodo: "POST", corpo: dados }),
  excluirBloqueio: (id: number) => api<void>(`/api/bloqueios/${id}`, { metodo: "DELETE" }),

  caminhoAgenda: (de: string, ate: string) => `/api/agenda?de=${de}&ate=${ate}`,
  caminhoResumo: "/api/agenda/resumo",
  confirmar: (id: number) => api<Agendamento>(`/api/agenda/${id}/confirmar`, { metodo: "PATCH" }),
  cancelar: (id: number) => api<Agendamento>(`/api/agenda/${id}/cancelar`, { metodo: "PATCH" }),
};
