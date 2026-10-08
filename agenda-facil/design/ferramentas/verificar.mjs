// Verifica o protótipo de três jeitos:
// 1. Navegação: percorre os fluxos do cliente e do dono do início ao fim.
// 2. Acessibilidade: roda o axe-core (regras WCAG 2.0, 2.1 e 2.2, níveis A e AA) em cada tela e estado.
// 3. Alvos de toque: lista controles menores que 44 x 44 px (links dentro de frases ficam de fora, como a WCAG permite).
// Também falha se aparecer erro no console.
// Como rodar (dentro de design/ferramentas): npm install && npm run verificar
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { TELAS, CELULAR, COMPUTADOR } from './telas.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const prototipo = path.join(aqui, '..', 'prototipo');
const endereco = (caminho) =>
  pathToFileURL(path.join(prototipo, caminho.split(/[?#]/)[0])).href + caminho.replace(/^[^?#]*/, '');

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--lang=pt-BR'] });
let falhas = 0;

async function abrir(caminho, tamanho) {
  // Um contexto por página (o axe precisa de um contexto criado com newContext)
  const contexto = await navegador.newContext({ viewport: tamanho, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pagina.on('pageerror', (e) => erros.push(e.message));
  await pagina.goto(endereco(caminho));
  await pagina.evaluate(() => document.fonts.ready);
  return { pagina, erros };
}

function relatar(titulo, problemas) {
  if (problemas.length === 0) { console.log(`ok    ${titulo}`); return; }
  falhas += problemas.length;
  console.log(`FALHA ${titulo}`);
  for (const p of problemas) console.log(`      - ${p}`);
}

// ---------- 1. Navegação ----------
async function fluxoCliente() {
  const { pagina, erros } = await abrir('cliente/index.html', CELULAR);
  await pagina.getByRole('link', { name: /^Corte 40 min/ }).click();
  await pagina.waitForURL(/profissional\.html\?servico=corte/);
  await pagina.getByRole('link', { name: /^Rafa/ }).click();
  await pagina.waitForURL(/horario\.html.*profissional=rafa/);
  await pagina.getByRole('link', { name: '16:20' }).click();
  await pagina.waitForURL(/dados\.html.*hora=16(%3A|:)20/);
  assert.match(await pagina.locator('.resumo').innerText(), /16:20 às 17:00/);

  // Enviar vazio mostra os erros e põe o foco no primeiro campo
  await pagina.getByRole('button', { name: 'Confirmar agendamento' }).click();
  assert.equal(await pagina.locator('#nome').getAttribute('aria-invalid'), 'true');
  assert.equal(await pagina.evaluate(() => document.activeElement.id), 'nome');

  // Regressão: com o WhatsApp pela metade, tocar em Confirmar tem que mostrar os dois erros
  // (antes, o erro do blur empurrava o botão e o toque se perdia)
  await pagina.reload();
  await pagina.locator('#whatsapp').fill('11 9123');
  await pagina.getByRole('button', { name: 'Confirmar agendamento' }).click();
  assert.equal(await pagina.locator('#nome').getAttribute('aria-invalid'), 'true');
  assert.equal(await pagina.locator('#whatsapp').getAttribute('aria-invalid'), 'true');

  await pagina.locator('#nome').fill('Lucas');
  await pagina.locator('#whatsapp').fill('');
  await pagina.locator('#whatsapp').pressSequentially('11912345678');
  assert.equal(await pagina.locator('#whatsapp').inputValue(), '(11) 91234-5678');
  await pagina.getByRole('button', { name: 'Confirmar agendamento' }).click();
  await pagina.waitForURL(/confirmado\.html/);
  await pagina.getByRole('heading', { name: 'Horário marcado' }).waitFor();
  assert.match(await pagina.locator('.cartao').innerText(), /16:20/);

  await pagina.getByRole('link', { name: 'Remarcar ou cancelar' }).click();
  await pagina.waitForURL(/meu-horario\.html/);
  await pagina.getByRole('button', { name: 'Cancelar agendamento' }).click();
  await pagina.locator('#confirmar-cancelamento').click();
  await pagina.getByText('Cancelado', { exact: true }).waitFor();
  relatar('fluxo do cliente: serviço → profissional → horário → dados → confirmado → cancelar', erros);
  await pagina.close();
}

async function fluxoDono() {
  const { pagina, erros } = await abrir('painel/cadastro.html', COMPUTADOR);
  await pagina.locator('#email').fill('voce@example.com');
  await pagina.locator('#senha').fill('senha-de-teste');
  await pagina.getByRole('button', { name: 'Continuar' }).click();
  await pagina.waitForURL(/servicos\.html/);
  await pagina.getByRole('button', { name: 'Pezinho' }).click();
  assert.equal(await pagina.locator('.linha-servico').count(), 5);
  await pagina.getByRole('button', { name: 'Continuar' }).click();
  await pagina.waitForURL(/horarios\.html/);
  await pagina.getByRole('button', { name: 'Criar meu link' }).click();
  await pagina.waitForURL(/link\.html/);
  await pagina.getByRole('link', { name: 'Ir para a agenda' }).click();
  await pagina.waitForURL(/agenda\.html/);

  // Confirmar a presença de Marcos
  await pagina.getByRole('button', { name: /14:20 às 15:00, Marcos/ }).click();
  await pagina.getByRole('button', { name: 'Marcar como confirmado' }).click();
  assert.equal(await pagina.locator('[data-conta="a-confirmar"]').innerText(), '3');

  // Bloquear 15:00 às 16:00 dá conflito com André; 15:00 às 15:40 não
  await pagina.getByRole('button', { name: 'Bloquear horário' }).first().click();
  assert.ok(await pagina.getByText('Já tem agendamento nesse intervalo').isVisible());
  assert.ok(await pagina.locator('#botao-bloquear').isDisabled());
  await pagina.locator('#bloquear-fim').fill('15:40');
  assert.ok(await pagina.locator('#botao-bloquear').isEnabled());
  await pagina.locator('#botao-bloquear').click();
  assert.equal(await pagina.locator('[data-conta="bloqueados"]').innerText(), '3');

  // Cancelar e desfazer
  await pagina.getByRole('button', { name: /16:20 às 17:00, Lucas/ }).click();
  await pagina.getByRole('button', { name: 'Cancelar agendamento' }).first().click();
  await pagina.locator('#confirmar-cancelar').click();
  assert.equal(await pagina.locator('[data-conta="total"]').innerText(), '10');
  await pagina.getByRole('button', { name: 'Desfazer' }).click();
  assert.equal(await pagina.locator('[data-conta="total"]').innerText(), '11');

  // Novo agendamento de quem ligou
  await pagina.getByRole('button', { name: 'Novo agendamento' }).click();
  await pagina.locator('#novo-cliente').fill('Cliente do balcão');
  await pagina.getByRole('button', { name: 'Salvar agendamento' }).click();
  assert.equal(await pagina.locator('[data-conta="total"]').innerText(), '12');
  relatar('fluxo do dono: cadastro → serviços → horários → link → agenda (confirmar, bloquear, cancelar, desfazer, novo)', erros);
  await pagina.close();
}

// ---------- 2 e 3. Acessibilidade e alvos de toque em cada tela ----------
async function verificarTela(tela) {
  const { pagina, erros } = await abrir(tela.caminho, tela.tamanho);
  if (tela.antes) await tela.antes(pagina);
  await pagina.waitForTimeout(100);

  // Guarda os erros de console de agora: o próprio axe tenta ler os CSS e, em file://, o navegador bloqueia
  const errosDaPagina = [...erros];
  const axe = await new AxeBuilder({ page: pagina })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const problemasAxe = axe.violations.map((v) => `axe ${v.id} (${v.impact}): ${v.nodes.length} elemento(s), ex.: ${v.nodes[0].target.join(' ')}`);

  const pequenos = await pagina.evaluate(() => {
    const seletor = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, label.chip';
    return [...document.querySelectorAll(seletor)]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const estilo = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || estilo.visibility === 'hidden' || estilo.opacity === '0') return false;
        if (el.closest('dialog:not([open])')) return false;
        // Link no meio de uma frase: a WCAG 2.5.8 deixa de fora
        if (el.tagName === 'A' && el.closest('p, li') && !el.matches('.botao, .opcao, .horario, .voltar, .resumo__alterar, .menu__item, .botao-icone')) return false;
        // Rádio e checkbox escondidos atrás de um rótulo grande: mede o rótulo
        if (el.matches('.chip input, .dia input')) return false;
        // Interruptor e caixa de seleção dentro de um rótulo: clicar no rótulo também marca, então vale o tamanho do rótulo
        const rotulo = el.matches('input') && el.closest('label');
        if (rotulo && rotulo.getBoundingClientRect().height >= 44) return false;
        return r.width < 44 || r.height < 44;
      })
      .map((el) => `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute('aria-label') || el.id).trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
  });

  relatar(`${tela.nome}`, [
    ...problemasAxe,
    ...pequenos.map((p) => `alvo menor que 44 px: ${p}`),
    ...errosDaPagina.map((e) => `console: ${e}`),
  ]);
  await pagina.close();
}

await fluxoCliente().catch((e) => relatar('fluxo do cliente', [e.message]));
await fluxoDono().catch((e) => relatar('fluxo do dono', [e.message]));
for (const tela of TELAS) await verificarTela(tela);

await navegador.close();
console.log(falhas === 0 ? '\nTudo certo.' : `\n${falhas} problema(s).`);
process.exit(falhas === 0 ? 0 : 1);
