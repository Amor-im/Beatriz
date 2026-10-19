// Tipos das respostas da API (espelham os records DTO do Java em api/src/main/java).

export type StatusAgendamento = "A_CONFIRMAR" | "CONFIRMADO" | "CANCELADO";

export type Negocio = {
  id: number;
  nome: string;
  slug: string;
  whatsapp: string;
  endereco: string | null;
};

export type Sessao = {
  donoId: number;
  nome: string;
  email: string;
  negocio: Negocio;
};

export type Servico = {
  id: number;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number | null;
  ativo: boolean;
};

export type NegocioPublico = {
  nome: string;
  slug: string;
  whatsapp: string;
  endereco: string | null;
  servicos: Servico[];
};

export type SituacaoDoDia = "LIVRE" | "LOTADO" | "ENCERRADO" | "FECHADO";

export type DiaDisponivel = {
  data: string; // "2026-10-20"
  situacao: SituacaoDoDia;
  livres: number;
};

export type HorariosLivres = {
  data: string;
  horarios: string[]; // ["09:00", "09:40"]
};

export type HorarioSugerido = {
  data: string;
  horario: string;
};

export type AgendamentoPublico = {
  codigo: string;
  status: StatusAgendamento;
  negocioNome: string;
  negocioSlug: string;
  negocioWhatsapp: string;
  negocioEndereco: string | null;
  servicoNome: string;
  duracaoMinutos: number;
  precoCentavos: number | null;
  data: string;
  inicio: string;
  fim: string;
  clienteNome: string;
};

export type Agendamento = {
  id: number;
  codigo: string;
  servicoNome: string;
  duracaoMinutos: number;
  clienteNome: string;
  clienteWhatsapp: string;
  data: string;
  inicio: string;
  fim: string;
  status: StatusAgendamento;
};

export type Bloqueio = {
  id: number;
  data: string;
  diaInteiro: boolean;
  inicio: string;
  fim: string;
  motivo: string | null;
};

export type Agenda = {
  agendamentos: Agendamento[];
  bloqueios: Bloqueio[];
};

export type ResumoSemana = {
  semanaInicio: string;
  semanaFim: string;
  agendados: number;
  confirmados: number;
  aConfirmar: number;
  cancelados: number;
  hoje: number;
};

export type DiaDaSemana = {
  diaSemana: number; // 1 = segunda ... 7 = domingo
  aberto: boolean;
  abre: string | null;
  fecha: string | null;
  almocoInicio: string | null;
  almocoFim: string | null;
};
