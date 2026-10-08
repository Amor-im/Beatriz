// Lista de telas e estados do protótipo. Usada pelos dois scripts:
// exportar-telas.mjs (tira os prints) e verificar.mjs (acessibilidade).
// "antes" é o que acontece na página antes do print (clicar, preencher...).

const q = 'servico=corte&profissional=rafa&dia=2026-10-08&hora=16:20';

export const CELULAR = { width: 390, height: 844 };
export const COMPUTADOR = { width: 1440, height: 900 };

export const TELAS = [
  // ---------- Cliente (celular) ----------
  { nome: 'cliente-1-servicos', caminho: 'cliente/index.html', tamanho: CELULAR, inteira: true },
  { nome: 'cliente-2-profissional', caminho: 'cliente/profissional.html?servico=corte', tamanho: CELULAR, inteira: true },
  { nome: 'cliente-3-horario', caminho: 'cliente/horario.html?servico=corte&profissional=rafa', tamanho: CELULAR, inteira: true },
  {
    nome: 'cliente-3b-dia-lotado', caminho: 'cliente/horario.html?servico=corte&profissional=rafa', tamanho: CELULAR, inteira: true,
    antes: (p) => p.locator('#dia-09').check(),
  },
  { nome: 'cliente-4-dados', caminho: `cliente/dados.html?${q}`, tamanho: CELULAR, inteira: true },
  {
    nome: 'cliente-4b-dados-erro', caminho: `cliente/dados.html?${q}`, tamanho: CELULAR, inteira: true,
    antes: async (p) => {
      await p.locator('#whatsapp').fill('11 9123');
      await p.getByRole('button', { name: 'Confirmar agendamento' }).click();
      await p.evaluate(() => window.scrollTo(0, 0)); // o print de página inteira sai com o cabeçalho no topo
    },
  },
  { nome: 'cliente-4c-horario-ocupado', caminho: 'cliente/horario-ocupado.html', tamanho: CELULAR, inteira: true },
  { nome: 'cliente-5-confirmado', caminho: `cliente/confirmado.html?${q}&nome=Lucas`, tamanho: CELULAR, inteira: true },
  { nome: 'cliente-6-meu-horario', caminho: `cliente/meu-horario.html?${q}`, tamanho: CELULAR, inteira: true },
  { nome: 'cliente-6b-cancelar', caminho: `cliente/meu-horario.html?${q}#cancelar-horario`, tamanho: CELULAR },

  // ---------- Dono: primeiro acesso (computador) ----------
  { nome: 'painel-1-cadastro', caminho: 'painel/cadastro.html', tamanho: COMPUTADOR, inteira: true },
  {
    nome: 'painel-1b-cadastro-erro', caminho: 'painel/cadastro.html', tamanho: COMPUTADOR, inteira: true,
    antes: async (p) => {
      await p.locator('#email').fill('rafa@');
      await p.locator('#senha').fill('1234');
      await p.getByRole('button', { name: 'Continuar' }).click();
      await p.evaluate(() => window.scrollTo(0, 0));
    },
  },
  { nome: 'painel-2-servicos', caminho: 'painel/servicos.html', tamanho: COMPUTADOR, inteira: true },
  { nome: 'painel-3-horarios', caminho: 'painel/horarios.html', tamanho: COMPUTADOR, inteira: true },
  { nome: 'painel-4-link', caminho: 'painel/link.html', tamanho: COMPUTADOR, inteira: true },

  // ---------- Dono: o dia (computador) ----------
  { nome: 'painel-5-agenda', caminho: 'painel/agenda.html', tamanho: COMPUTADOR, inteira: true },
  { nome: 'painel-5b-cancelar', caminho: 'painel/agenda.html#cancelar', tamanho: COMPUTADOR },
  {
    nome: 'painel-5c-cancelado-desfazer', caminho: 'painel/agenda.html', tamanho: COMPUTADOR,
    antes: async (p) => {
      await p.getByRole('button', { name: 'Cancelar agendamento' }).first().click();
      await p.locator('#confirmar-cancelar').click();
    },
  },
  { nome: 'painel-5d-bloquear-conflito', caminho: 'painel/agenda.html#bloquear', tamanho: COMPUTADOR },
  { nome: 'painel-5e-novo-agendamento', caminho: 'painel/agenda.html#novo', tamanho: COMPUTADOR },
  { nome: 'painel-5f-agenda-vazia', caminho: 'painel/agenda-vazia.html', tamanho: COMPUTADOR },

  // ---------- Dono: o dia (celular) ----------
  { nome: 'painel-6-agenda-celular', caminho: 'painel/agenda-celular.html', tamanho: CELULAR },
  { nome: 'painel-6b-detalhe-celular', caminho: 'painel/agenda-celular.html#detalhe', tamanho: CELULAR },

  // ---------- Design system ----------
  { nome: 'design-system-componentes', caminho: 'componentes.html', tamanho: COMPUTADOR, inteira: true },
];
