import { expect, test } from "@playwright/test";

import { horarioLivre, SLUG } from "./apoio";
import { semViolacoes } from "./axe";

test("páginas do cliente passam no axe", async ({ page, request }) => {
  await page.goto(`/${SLUG}`);
  await expect(page.getByRole("heading", { name: "Studio Exemplo" })).toBeVisible();
  await semViolacoes(page);

  const livre = await horarioLivre(request, "Corte", 1);
  await page.goto(`/${SLUG}?servico=${livre.servicoId}&data=${livre.data}`);
  await expect(page.locator("section ul.grid-cols-3 a").first()).toBeVisible();
  await semViolacoes(page);

  await page.goto(`/${SLUG}?servico=${livre.servicoId}&data=${livre.data}&horario=${livre.horario}`);
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();
  await expect(page.getByText("Informe seu nome (pelo menos 2 letras).")).toBeVisible();
  await semViolacoes(page); // com as mensagens de erro na tela
});
