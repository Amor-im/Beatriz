import { expect, test } from "@playwright/test";

import { API, horarioLivre, PASTA_DOS_PRINTS, SLUG } from "./apoio";

test("cliente agenda pelo celular, sem criar conta", async ({ page }) => {
  await page.goto(`/${SLUG}`);
  await expect(page.getByRole("heading", { name: "Studio Exemplo" })).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/cliente-1-servicos.png`, fullPage: true });

  // 1. serviço
  await page.getByRole("link", { name: /^Corte\b.*40 min/ }).click();
  await expect(page.getByRole("heading", { name: "Quando?" })).toBeVisible();

  // 2. dia e horário: escolhe um dia (a partir de amanhã) com pelo menos 3 horários livres
  const dias = page.getByRole("navigation", { name: "Escolha o dia" }).getByRole("link", { name: /^(?!.*hoje).*: ([3-9]|\d\d) horários livres/ });
  await dias.first().click();
  const horarios = page.locator("section ul.grid-cols-3 a");
  await expect(horarios.first()).toBeVisible();
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/cliente-2-dia-e-horario.png`, fullPage: true });
  const horarioEscolhido = (await horarios.nth(1).textContent())!;
  await horarios.nth(1).click();

  // 3. dados
  await expect(page.getByRole("heading", { name: "Confira e confirme" })).toBeVisible();
  await expect(page.getByText(`${horarioEscolhido} às`)).toBeVisible();
  await page.getByLabel("Seu nome").fill("Cliente de exemplo C");
  await page.getByLabel("WhatsApp").fill("11900000000");
  await expect(page.getByLabel("WhatsApp")).toHaveValue("(11) 90000-0000");
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/cliente-3-dados.png`, fullPage: true });
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();

  // confirmação com resumo, .ics e WhatsApp
  await expect(page.getByRole("heading", { name: "Horário reservado" })).toBeVisible();
  await expect(page.getByText(horarioEscolhido, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Salvar na agenda do celular" })).toHaveAttribute("href", /calendario\.ics$/);
  await expect(page.getByRole("link", { name: "Avisar no WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/55/);
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/cliente-4-confirmado.png`, fullPage: true });
});

test("se outra pessoa confirma antes, o cliente vê o aviso e escolhe outro horário", async ({ page, request }) => {
  const livre = await horarioLivre(request, "Corte", 2);
  await page.goto(`/${SLUG}?servico=${livre.servicoId}&data=${livre.data}&horario=${livre.horario}`);
  await page.getByLabel("Seu nome").fill("Cliente de exemplo C");
  await page.getByLabel("WhatsApp").fill("11900000000");

  // enquanto isso, outra pessoa marca o mesmo horário
  const outraPessoa = await request.post(`${API}/api/publico/negocios/${SLUG}/agendamentos`, {
    data: { ...livre, clienteNome: "Cliente de exemplo D", clienteWhatsapp: "11911111111" },
  });
  expect(outraPessoa.status()).toBe(201);

  await page.getByRole("button", { name: "Confirmar agendamento" }).click();
  const aviso = page.getByRole("alert").filter({ hasText: "acabou de ser reservado" });
  await expect(aviso).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
  // nome e WhatsApp continuam preenchidos
  await expect(page.getByLabel("Seu nome")).toHaveValue("Cliente de exemplo C");
  await page.screenshot({ path: `${PASTA_DOS_PRINTS}/cliente-5-horario-ocupado.png`, fullPage: true });

  await aviso.getByRole("link").first().click();
  await expect(page.getByRole("button", { name: "Confirmar agendamento" })).toBeEnabled();
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();
  await expect(page.getByRole("heading", { name: "Horário reservado" })).toBeVisible();
});

test("link de negócio que não existe mostra a página de não encontrado", async ({ page }) => {
  await page.goto("/negocio-que-nao-existe");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
