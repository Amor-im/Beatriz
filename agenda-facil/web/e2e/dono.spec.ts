import { expect, test } from "@playwright/test";

import { API, horarioLivre, PASTA_DOS_PRINTS, SLUG } from "./apoio";

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
  // um cliente acabou de marcar (nome único: o teste pode rodar várias vezes no mesmo banco)
  const cliente = `Cliente de exemplo ${Date.now() % 1000}`;
  const livre = await horarioLivre(request, "Escova", 1);
  const marcado = await request.post(`${API}/api/publico/negocios/${SLUG}/agendamentos`, {
    data: { ...livre, clienteNome: cliente, clienteWhatsapp: "11922222222" },
  });
  expect(marcado.status()).toBe(201);

  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("dono@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-de-exemplo-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Agenda", exact: true })).toBeVisible();
  await expect(page.getByText("Agendados na semana")).toBeVisible();

  // vai até a semana do agendamento
  await page.getByRole("button", { name: "semana", exact: true }).click();
  for (let i = 0; i < semanasAte(livre.data); i++) {
    await page.getByRole("button", { name: "Próxima semana" }).click();
  }
  await expect(page.getByRole("button", { name: new RegExp(cliente) })).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-1-agenda-semana.png`, fullPage: true });

  await page.getByRole("button", { name: new RegExp(cliente) }).click();
  const detalhe = page.getByRole("dialog");
  await expect(detalhe.getByRole("heading", { name: cliente })).toBeVisible();
  await expect(detalhe.getByRole("link", { name: "Pedir confirmação no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5511922222222/);
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-2-detalhe.png` });
  await detalhe.getByRole("button", { name: "Marcar como confirmado" }).click();
  await expect(page.getByRole("status").filter({ hasText: "confirmado" })).toBeVisible();

  // abre o dia e confere a linha do tempo
  await page.getByRole("button", { name: new RegExp(`Abrir o dia ${Number(livre.data.slice(8))}$`) }).click();
  await expect(page.getByRole("button", { name: new RegExp(`${cliente}.*Confirmado`) })).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/dono-3-agenda-dia.png`, fullPage: true });
});

test("dono navega por serviços, horários e meu link", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("dono@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-de-exemplo-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Agenda", exact: true })).toBeVisible();

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
