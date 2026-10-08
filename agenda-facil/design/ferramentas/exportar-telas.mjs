// Tira um print de cada tela do protótipo e salva em design/telas/.
// Como rodar (dentro de design/ferramentas):
//   npm install
//   npx playwright install chromium   (só na primeira vez)
//   npm run telas
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { TELAS } from './telas.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const prototipo = path.join(aqui, '..', 'prototipo');
const destino = path.join(aqui, '..', 'telas');

// --lang=pt-BR: campos de hora em 24 h e datas em dd/mm/aaaa, como no Brasil
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--lang=pt-BR'],
});

for (const tela of TELAS) {
  const pagina = await navegador.newPage({
    viewport: tela.tamanho,
    deviceScaleFactor: tela.tamanho.width < 600 ? 2 : 1, // celular em 2x (nítido no portfólio); computador em 1x (arquivo menor)
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  await pagina.emulateMedia({ reducedMotion: 'reduce' }); // sem animação no meio do print
  await pagina.goto(pathToFileURL(path.join(prototipo, tela.caminho.split(/[?#]/)[0])).href + tela.caminho.replace(/^[^?#]*/, ''));
  await pagina.evaluate(() => document.fonts.ready);
  if (tela.antes) await tela.antes(pagina);
  await pagina.waitForTimeout(150);
  await pagina.screenshot({ path: path.join(destino, `${tela.nome}.png`), fullPage: Boolean(tela.inteira) });
  console.log(`ok  ${tela.nome}.png`);
  await pagina.close();
}

// Capa do README e do card do portfólio (usa os prints que acabaram de ser tirados)
const capa = await navegador.newPage({ viewport: { width: 1600, height: 900 } });
await capa.goto(pathToFileURL(path.join(aqui, 'capa.html')).href);
await capa.evaluate(() => document.fonts.ready);
await capa.screenshot({ path: path.join(aqui, '..', '..', 'docs', 'capa.png') });
console.log('ok  docs/capa.png');

await navegador.close();
