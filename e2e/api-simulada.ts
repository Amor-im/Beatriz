import { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A Fake Store API é externa: o teste não pode depender dela estar no ar.
 * Aqui o navegador intercepta as chamadas para fakestoreapi.com e responde com
 * o catálogo local (src/assets/produtos.json), que tem os mesmos campos da API.
 */
const catalogo: { id: number }[] = JSON.parse(
  readFileSync(resolve('src/assets/produtos.json'), 'utf8'),
);

export async function simularApi(page: Page, opcoes: { foraDoAr?: boolean } = {}): Promise<void> {
  await page.route('https://fakestoreapi.com/**', async (route) => {
    if (opcoes.foraDoAr) {
      return route.abort('failed');
    }
    const url = new URL(route.request().url());
    const rota = url.pathname.match(/^\/products\/?(\d+)?$/);
    if (!rota) {
      return route.fulfill({ status: 404 });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, json: { id: 21, ...route.request().postDataJSON() } });
    }
    const corpo = rota[1] ? (catalogo.find((p) => p.id === Number(rota[1])) ?? null) : catalogo;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpo) });
  });
}
