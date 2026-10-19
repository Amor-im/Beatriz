import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Roda o axe (regras WCAG 2.1 A e AA) na página aberta e falha se encontrar violação. */
export async function semViolacoes(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const resumo = resultado.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
  expect(resumo).toEqual([]);
}
