# Vitrine · loja em Angular

Loja virtual de demonstração feita em **Angular 20**: catálogo com busca e filtros na URL, carrinho com **signals** salvo no navegador e checkout simulado com **formulário reativo**.

![Fluxo de compra: catálogo, filtro, detalhe, carrinho, checkout e pedido confirmado](docs/fluxo-compra.gif)

- **Ver online:** em breve <!-- TODO(Beatriz): colocar o link quando fizer o deploy -->
- **Código:** [github.com/beatrizcampos-dev/loja-angular](https://github.com/beatrizcampos-dev/loja-angular)
- **Autora:** Beatriz Campos Alves · <!-- TODO(Beatriz): link do LinkedIn --> LinkedIn em breve

> Nenhuma compra é real: não existe cobrança, entrega nem envio de e-mail.

---

## O problema

Uma loja virtual parece simples até a primeira coisa dar errado: a API cai e a tela fica vazia sem explicação, o carrinho some ao recarregar a página, o formulário aceita CEP pela metade, o celular não consegue tocar no botão. Este projeto é a minha resposta a esses casos, usando só o que o próprio Angular oferece.
<!-- TODO(Beatriz): revisar este parágrafo com as suas palavras. -->

## Funcionalidades

- **Catálogo** com busca (sem diferenciar acentos), filtro por categoria, "só promoções" e ordenação por preço ou nome. Os filtros ficam na URL: o link pode ser compartilhado e o botão Voltar funciona.
- **Estados de tela de verdade:** esqueleto enquanto carrega, aviso quando a API cai e a loja usa a cópia local, erro com "Tentar de novo", estado vazio com ação.
- **Detalhe do produto** com galeria (zoom ao clicar), preço com desconto, seletor de quantidade e aviso (toast) ao adicionar.
- **Carrinho** com quantidade, remover, subtotal, frete simulado (grátis a partir de R$ 299) e barra de progresso até o frete grátis. Continua salvo depois de fechar o navegador.
- **Checkout simulado** com validação (e-mail, CEP com máscara 00000-000, endereço), foco no primeiro campo com erro e tela de pedido confirmado.
- **Cadastro de produto** com formulário reativo e prévia do card enquanto a pessoa digita.
- **Página 404**, título da aba por página e rotas carregadas sob demanda.

| Celular (390 px) | Computador (1440 px) |
|---|---|
| ![Carrinho no celular](docs/screens/depois-carrinho-390.png) | ![Catálogo filtrado no computador](docs/screens/depois-catalogo-filtrado-1440.png) |

Mais telas, antes e depois, em [`docs/screens/`](docs/screens/).

## De onde veio: começou como TP1 no IFSP

Começou como trabalho prático (TP1) da disciplina de Técnicas de Programação 1 no IFSP. Depois evoluí o projeto para parecer um produto real, mantendo o histórico de commits das aulas.
<!-- TODO(Beatriz): confirmar o nome da disciplina e o câmpus. O código do TP diz "Técnicas de Programação 1"; o briefing falava em "disciplina de Web". -->

| No TP1 | Agora |
|---|---|
| Se a API caía, aparecia "Nenhum produto em promoção encontrado" | Cópia local do catálogo + aviso + "Tentar de novo" |
| Página de cadastro em branco (erro no template) | Formulário reativo validado, com prévia do card |
| Botões "Adicionar" e "Detalhes" abriam `alert()` | Carrinho com signals, persistido no `localStorage` |
| Estoque e promoção sorteados com `Math.random()` a cada reload | Regra fixa por id, previsível e testada |
| Desconto arredondado para reais inteiros | Arredondado para centavos, mesma conta no pipe e no carrinho |
| Preço no detalhe aparecia como "synbol109.95" | R$ 109,95 com `LOCALE_ID` pt-BR |
| `any` no service, URL da API fixa no código | Tipos da API + `environment` |
| Pastas `produto/` e `produtos/`, componente `qunatidade-controle` | Uma pasta por funcionalidade, nomes corrigidos |
| Rota inexistente voltava para a home | Página 404 |
| Todas as páginas no bundle inicial | `loadComponent` em todas as rotas |
| 15 testes, 9 falhando | 115 testes passando |
| Logo institucional e imagens de medicamentos na pasta pública | Identidade visual própria e só imagens do catálogo |

## Decisões de design

- **Identidade:** a loja se chama Vitrine. A foto de cada produto fica sobre um fundo "de vidro" verde-claro e o preço aparece numa **etiqueta amarela**, com ponta e furo, como as de papel penduradas nas lojas. É o único elemento chamativo; o resto da interface é discreto.
<!-- TODO(Beatriz): confirmar se quer manter o nome "Vitrine". -->
- **Cores:** verde-escuro `#0f5c4d` (ações), amarelo `#f6c445` (etiquetas), tinta `#14201c` (texto). O verde é uma homenagem ao verde do TP original, mais escuro para passar no contraste AA.
- **Tipografia:** Archivo expandida nos títulos (lembra letreiro de loja) e Instrument Sans no texto.
- **Tokens em `:root`:** cores, espaços de 8/16/24/40/64 px, raio e sombra. Os componentes só usam as variáveis (`src/styles.css`).
- **Mobile primeiro:** grade de 2 colunas no celular, barra fixa com total e "Finalizar compra" no carrinho, alvos de toque de pelo menos 44 px.
- **Acessibilidade:** link "Pular para o conteúdo", foco visível, rótulos em todos os campos, erros ligados ao campo (`aria-describedby`), avisos em `aria-live`, `lang="en"` nos textos que a API manda em inglês.

## Tecnologias

- Angular 20 (componentes standalone, signals, `@if`/`@for`, `input()`/`output()`/`model()`)
- TypeScript, RxJS
- Angular Router (lazy loading, guard funcional, `TitleStrategy`, `withComponentInputBinding`)
- Reactive Forms, HttpClient, `NgOptimizedImage`
- Jasmine + Karma (com `HttpTestingController`)
- CSS puro com variáveis (sem biblioteca de UI)
- Dados: [Fake Store API](https://fakestoreapi.com)

As decisões técnicas estão explicadas em linguagem simples no [ESTUDO.md](ESTUDO.md).

## Como rodar

Pré-requisito: Node.js 20 ou mais novo.

```bash
npm install
npm start            # abre em http://localhost:4200
npm test             # testes com o navegador aberto
npm run test:ci      # testes sem janela (terminal/CI)
npm run build        # build de produção em dist/
```

## Qualidade medida

Medido em 08/10/2026 no build de produção servido localmente, com o Lighthouse 12 (perfil móvel, rede e CPU simuladas) e o axe-core. A Fake Store API foi substituída por uma cópia local dela durante a medição.

| Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Início | 93 | 100 | 100 | 100 |
| Produtos | 80 | 100 | 100 | 100 |
| Detalhe | 93 | 100 | 100 | 100 |
| Carrinho | 95 | 100 | 100 | 100 |
| Sobre | 97 | 100 | 100 | 100 |

- Com a API fora do ar (loja usando o catálogo local), Performance ficou entre 81 e 96; Boas práticas cai para 96 nas páginas que chamam a API, só por causa do erro de rede registrado no console.
- O que mais pesa na página de produtos são as fotos que a Fake Store API serve (JPG de até 1500 px). A cópia local usa WebP de 600 px.
- axe-core: 0 violações em todas as telas, em 1440 px e 390 px, inclusive com erros de formulário na tela.
- O fluxo completo (listar → filtrar → detalhe → adicionar → carrinho → checkout → confirmação) foi verificado com Playwright em 1440 px e 390 px, sem erros no console.

## O que pratiquei e próximos passos

Pratiquei:
- separar estado (signals) de eventos no tempo (RxJS) e saber explicar por quê;
- tratar erro de API de um jeito que a pessoa entenda o que aconteceu;
- formulários reativos com validação condicional, máscara e acessibilidade;
- testar service com `HttpTestingController` e componente com `TestBed`.
<!-- TODO(Beatriz): ajustar esta lista ao que você sente que aprendeu de verdade. -->

Próximos passos:
- deploy (Vercel ou similar) e link no topo deste README;
- servir as fotos por uma CDN que redimensiona (loader do `NgOptimizedImage`) e hospedar as fontes junto com o app;
- sincronizar o carrinho entre abas abertas (evento `storage`);
- testes de ponta a ponta (Playwright) no repositório, rodando no GitHub Actions;
- buscar o endereço pelo CEP (ViaCEP);
- experimentar o `httpResource` quando ele sair da fase experimental.

---

Produtos, textos e fotos do catálogo vêm da [Fake Store API](https://fakestoreapi.com), projeto open source de MohammadReza Keikavousi (código sob licença MIT). A cópia local em `src/assets/produtos.json` e as fotos em `public/images/produtos/` foram geradas a partir dos dados públicos da API. Nomes e descrições dos produtos estão em inglês, como a API envia.
