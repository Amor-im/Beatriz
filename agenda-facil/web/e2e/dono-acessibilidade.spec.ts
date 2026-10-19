import { expect, test } from "@playwright/test";

import { semViolacoes } from "./axe";

test("telas de conta e do painel passam no axe", async ({ page }) => {
  await page.goto("/cadastro");
  await semViolacoes(page);
  await page.goto("/entrar");
  await semViolacoes(page);

  await page.getByLabel("E-mail").fill("dono@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-de-exemplo-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Agendados na semana")).toBeVisible();
  for (const rota of ["/painel", "/painel/servicos", "/painel/horarios", "/painel/link"]) {
    await page.goto(rota);
    await expect(page.locator("main h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await semViolacoes(page);
  }
});
