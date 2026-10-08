import { expect, test } from '@playwright/test';
import { semViolacoesDeAcessibilidade } from './acessibilidade';
import { simularApi } from './api-simulada';

test.describe('com a API no ar', () => {
  test.beforeEach(async ({ page }) => {
    await simularApi(page);
  });

  test('listar → filtrar → detalhe → adicionar → carrinho → checkout → confirmação', async ({
    page,
  }) => {
    const errosNoConsole: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errosNoConsole.push(msg.text()));
    page.on('pageerror', (erro) => errosNoConsole.push(erro.message));

    // Início
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('numa vitrine só');
    await semViolacoesDeAcessibilidade(page);

    // Catálogo
    await page.getByRole('link', { name: 'Ver produtos' }).first().click();
    await expect(page).toHaveURL(/\/produtos$/);
    await expect(page.locator('app-card-produto')).toHaveCount(20);
    await semViolacoesDeAcessibilidade(page);

    // Filtro por categoria, ordenação e busca: tudo vai para a URL
    await page.getByRole('link', { name: 'Eletrônicos' }).click();
    await expect(page).toHaveURL(/categoria=eletronicos/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eletrônicos');
    await page.getByLabel('Ordenar por').selectOption('menor-preco');
    await expect(page).toHaveURL(/ordem=menor-preco/);
    await page.getByLabel('Buscar').fill('ssd');
    await expect(page).toHaveURL(/busca=ssd/);
    await expect(page.locator('app-card-produto')).toHaveCount(2);

    // Detalhe
    await page.getByRole('link', { name: /SanDisk SSD PLUS/ }).click();
    await expect(page).toHaveURL(/\/produtos\/10$/);
    await expect(page).toHaveTitle(/^SanDisk SSD PLUS .* \| Vitrine$/);
    await semViolacoesDeAcessibilidade(page);

    // Adicionar 2 unidades
    await page.getByRole('button', { name: /Aumentar quantidade/ }).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.getByText('2 unidades adicionadas ao carrinho')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Carrinho, 2 itens' })).toBeVisible();

    // Carrinho (e continua salvo depois de recarregar)
    await page.getByRole('link', { name: 'Ver carrinho' }).click();
    await expect(page).toHaveURL(/\/carrinho$/);
    await expect(page.locator('.item')).toHaveCount(1);
    await semViolacoesDeAcessibilidade(page);
    await page.reload();
    await expect(page.locator('.item')).toHaveCount(1);

    // Checkout: enviar vazio mostra os erros e leva o foco ao primeiro campo
    await page.getByRole('link', { name: 'Finalizar compra' }).first().click();
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByRole('button', { name: /Confirmar pedido/ }).click();
    await expect(page.getByLabel('Nome completo')).toBeFocused();
    await expect(page.getByText('Digite seu nome completo.')).toBeVisible();
    await semViolacoesDeAcessibilidade(page);

    // Preencher, com a máscara do CEP
    await page.getByLabel('Nome completo').fill('Ana Souza');
    await page.getByLabel('E-mail').fill('ana@exemplo.com');
    await page.getByLabel('CEP').pressSequentially('01310100');
    await expect(page.getByLabel('CEP')).toHaveValue('01310-100');
    await page.getByLabel('Rua ou avenida').fill('Avenida Paulista');
    await page.getByLabel('Número').fill('1000');
    await page.getByLabel('Cidade').fill('São Paulo');
    await page.getByLabel('Estado').selectOption('SP');
    await page.getByRole('button', { name: /Confirmar pedido/ }).click();

    // Confirmação
    await expect(page).toHaveURL(/\/pedido-confirmado$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pedido confirmado, Ana!');
    await expect(page.locator('.carrinho__badge')).toHaveCount(0);
    await semViolacoesDeAcessibilidade(page);

    expect(errosNoConsole).toEqual([]);
  });

  test('cadastro de produto: mostra os erros, atualiza a prévia e confirma o envio', async ({
    page,
  }) => {
    await page.goto('/produtos/novo');
    await page.getByRole('button', { name: 'Cadastrar produto' }).click();
    await expect(page.getByText('Digite o nome do produto.')).toBeVisible();
    await semViolacoesDeAcessibilidade(page);

    await page.getByLabel('Nome do produto').fill('Caneca de cerâmica');
    await expect(page.locator('.cadastro__previa')).toContainText('Caneca de cerâmica');
    await page.getByLabel('Preço (US$)').fill('39.9');
    await page.getByLabel('Categoria').selectOption('joias');
    await page.getByLabel('Descrição').fill('Caneca de 300 ml, pode ir ao micro-ondas.');
    await page.getByRole('button', { name: 'Cadastrar produto' }).click();

    await expect(page.getByText('A API respondeu com o id 21')).toBeVisible();
  });

  test('endereço que não existe abre a página 404', async ({ page }) => {
    await page.goto('/pagina-que-nao-existe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
    await expect(page).toHaveTitle('Página não encontrada | Vitrine');
    await semViolacoesDeAcessibilidade(page);
  });
});

test.describe('com a API fora do ar', () => {
  test('o catálogo usa a cópia local e avisa', async ({ page }) => {
    await simularApi(page, { foraDoAr: true });
    await page.goto('/produtos');

    await expect(page.getByText('você está vendo a cópia local do catálogo')).toBeVisible();
    await expect(page.locator('app-card-produto')).toHaveCount(20);

    // Abrir um produto e voltar não pode apagar o aviso (o aviso fala da lista).
    await page.getByRole('link', { name: /Fjallraven/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Fjallraven');
    await page.goBack();
    await expect(page.getByText('você está vendo a cópia local do catálogo')).toBeVisible();
    await semViolacoesDeAcessibilidade(page);
  });
});
