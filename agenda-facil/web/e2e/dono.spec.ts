import { expect, test, type Page } from "@playwright/test";

import { API, horarioLivre, PASTA_DOS_PRINTS, SLUG } from "./apoio";

async function entrar(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("dono@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-de-exemplo-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Agenda", exact: true })).toBeVisible();
}

/** Quantas semanas (de segunda a domingo) separam hoje da data. */
function semanasAte(data: string): number {
  const segunda = (d: Date) => {
    const copia = new Date(d);
    copia.setUTCDate(copia.getUTCDate() - ((copia.getUTCDay() + 6) % 7));
    return copia;
  };
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const diferenca = segunda(new Date(`${data}T12:00:00Z`)).getTime() - segunda(new Date(`${hoje}T12:00:00Z`)).getTime();
  return Math.round(diferenca / (7 * 24 * 60 * 60 * 1000));
}

test("painel sem login manda para a tela de entrar", async ({ page }) => {
  await page.goto("/painel/servicos");
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fpainel%2Fservicos/);
});

test("senha errada mostra a mensagem da API", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("dono@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-errada-de-teste");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível entrar" })).toContainText("E-mail ou senha incorretos.");
});

test("dono entra, vê a agenda da semana e confirma um agendamento", async ({ page, request }) => {
  // um cliente acabou de marcar
  const cliente = "Cliente para confirmar";
  const livre = await horarioLivre(request, "Escova", 1);
  const marcado = await request.post(`${API}/api/publico/negocios/${SLUG}/agendamentos`, {
    data: { ...livre, clienteNome: cliente, clienteWhatsapp: "11922222222" },
  });
  expect(marcado.status()).toBe(201);

  await entrar(page);
  await expect(page.getByText("Agendados na semana")).toBeVisible();

  // vai até a semana do agendamento
  await page.getByRole("button", { name: "semana", exact: true }).click();
  for (let i = 0; i < semanasAte(livre.data); i++) {
    await page.getByRole("button", { name: "Próxima semana" }).click();
  }
  // o horário identifica o agendamento: o mesmo nome pode existir de execuções anteriores, o mesmo horário ativo não
  const doDia = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: `Abrir o dia ${Number(livre.data.slice(8))}`, exact: true }) });
  const botao = doDia.getByRole("button", { name: new RegExp(`^${livre.horario} ${cliente}`) });
  await expect(botao).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-1-agenda-semana.png`, fullPage: true });

  await botao.click();
  const detalhe = page.getByRole("dialog");
  await expect(detalhe.getByRole("heading", { name: cliente })).toBeVisible();
  await expect(detalhe.getByRole("link", { name: "Pedir confirmação no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5511922222222/);
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-2-detalhe.png` });
  await detalhe.getByRole("button", { name: "Marcar como confirmado" }).click();
  const aviso = page.getByRole("status").filter({ hasText: "confirmado" });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("button", { name: "Fechar" }).click();

  // abre o dia e confere a linha do tempo
  await page.getByRole("button", { name: `Abrir o dia ${Number(livre.data.slice(8))}`, exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(`^${livre.horario} ${cliente}.*Confirmado`) })).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-3-agenda-dia.png`, fullPage: true });
});

test("quando o dono cancela, o link de confirmação do cliente mostra o cancelamento", async ({ page, request }) => {
  const livre = await horarioLivre(request, "Escova", 3);
  const resposta = await request.post(`${API}/api/publico/negocios/${SLUG}/agendamentos`, {
    data: { ...livre, clienteNome: "Cliente que vai ser cancelado", clienteWhatsapp: "11933333333" },
  });
  expect(resposta.status()).toBe(201);
  const { codigo } = await resposta.json();
  const linkDoCliente = `/${SLUG}/confirmado/${codigo}`;

  await page.goto(linkDoCliente);
  await expect(page.getByRole("heading", { name: "Horário reservado" })).toBeVisible();

  // o dono entra e cancela pela agenda do dia
  await entrar(page);
  await page.getByRole("button", { name: "semana", exact: true }).click();
  for (let i = 0; i < semanasAte(livre.data); i++) {
    await page.getByRole("button", { name: "Próxima semana" }).click();
  }
  await page.getByRole("button", { name: `Abrir o dia ${Number(livre.data.slice(8))}`, exact: true }).click();
  await page.getByRole("button", { name: new RegExp(`^${livre.horario} Cliente que vai ser cancelado`) }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar agendamento" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Sim, cancelar" }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Avisar no WhatsApp" })).toBeVisible();

  // o cliente abre o mesmo link de novo
  await page.goto(linkDoCliente);
  await expect(page.getByRole("heading", { name: "Horário cancelado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Salvar na agenda do celular" })).toHaveCount(0);
  const ics = await request.get(`${API}/api/publico/agendamentos/${codigo}/calendario.ics`);
  expect(await ics.text()).toContain("STATUS:CANCELLED");
});

test("painel também funciona no celular, com a barra de navegação embaixo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page);
  await expect(page.getByText("Agendados na semana")).toBeVisible();
  const barra = page.getByRole("navigation", { name: "Painel" }).last();
  await expect(barra).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-7-agenda-celular.png` });
  await barra.getByRole("link", { name: "Serviços" }).click();
  await expect(page.getByRole("heading", { name: "Serviços" })).toBeVisible();
});

test("dono navega por serviços, horários e meu link", async ({ page }) => {
  await entrar(page);

  await page.getByRole("navigation", { name: "Painel" }).first().getByRole("link", { name: "Serviços" }).click();
  await expect(page.getByRole("heading", { name: "Serviços" })).toBeVisible();
  await expect(page.getByText("Corte e escova")).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-4-servicos.png`, fullPage: true });

  await page.getByRole("navigation", { name: "Painel" }).first().getByRole("link", { name: "Horários" }).click();
  await expect(page.getByRole("heading", { name: "Quando você atende?" })).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-5-horarios.png`, fullPage: true });

  await page.getByRole("navigation", { name: "Painel" }).first().getByRole("link", { name: "Meu link" }).click();
  await expect(page.getByText("localhost:3000/studio-exemplo").first()).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-6-meu-link.png`, fullPage: true });
});
