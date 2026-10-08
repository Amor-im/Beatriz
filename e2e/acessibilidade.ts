import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

/** Roda o axe-core na tela atual e falha se houver qualquer violação de WCAG 2.2 A/AA. */
export async function semViolacoesDeAcessibilidade(page: Page): Promise<void> {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const violacoes = resultado.violations.map((v) => `${v.id}: ${v.help}`);
  expect(violacoes, 'violações de acessibilidade').toEqual([]);
}
