# ESTUDO.md · as decisões do projeto, explicadas por mim

Este arquivo é o meu roteiro para explicar a Vitrine numa entrevista. Para cada decisão: **o que é**, **por que usei aqui**, **onde está no código** e **uma pergunta para treinar** (com a ideia principal da resposta).

> TODO(Beatriz): ler tudo em voz alta e reescrever com as suas palavras o que soar artificial. Numa entrevista, vale mais a sua explicação do que uma frase decorada.

---

## 1. Componentes standalone

**O que é.** Desde o Angular 17 o padrão é o componente "standalone": ele declara no próprio `@Component` tudo de que precisa (`imports: [...]`), sem precisar de um `NgModule`.

**Por que usei.** O projeto já nasceu assim no TP. Mantive porque deixa cada componente autoexplicativo: abrindo `card-produto.ts` dá para ver que ele usa `NgOptimizedImage`, `RouterLink` e a etiqueta de preço, e nada mais. Também é o que permite o lazy loading com `loadComponent` (seção 5).

**Onde.** Todos os componentes, por exemplo `src/app/features/produtos/card-produto/card-produto.ts`.

**Pergunta para treinar.** *"Qual a diferença entre um componente standalone e um declarado em NgModule?"*
Ideia da resposta: no standalone as dependências ficam no próprio componente; com NgModule elas ficam no módulo que o declara. Standalone tem menos arquivos, é mais fácil de testar (`imports: [Componente]` no TestBed) e de carregar sob demanda.

---

## 2. Signals × RxJS

**O que é.** *Signal* é um valor reativo síncrono: `signal()` guarda um valor, `computed()` calcula outro a partir dele e se atualiza sozinho, `effect()` roda um efeito colateral quando algo muda. *RxJS* trabalha com *fluxos* de eventos no tempo (Observables).

**Por que usei os dois.** Uso cada um no que faz melhor:

- **Signals para estado.** O carrinho é uma lista (`signal<ItemCarrinho[]>`) e todo o resto é derivado com `computed`: quantidade total, subtotal, frete, total. Não existe "atualizar o total" à mão; se a lista muda, o total muda. Para salvar no `localStorage` usei `effect`, porque salvar é um efeito colateral, não um valor.
- **RxJS para coisas que acontecem no tempo.** Requisições HTTP (`HttpClient` devolve Observable), o *debounce* da busca (espera a pessoa parar de digitar 300 ms antes de mexer na URL) e o `switchMap` do detalhe (se o `:id` muda antes da resposta chegar, cancela a requisição antiga).
- **A ponte entre os dois:** `toSignal()` no formulário de cadastro (valores do form viram signal para a prévia do card) e `toObservable()` no detalhe (o input `id` vira Observable para usar `switchMap`).

**Onde.** `features/carrinho/carrinho.service.ts`, `features/produtos/lista-produtos/lista-produtos.ts` (debounce), `features/produtos/produto-detalhe/produto-detalhe.ts` (switchMap).

**Pergunta para treinar.** *"Quando você usa computed e quando usa effect?"*
Ideia da resposta: `computed` quando quero um **valor** derivado (total do carrinho). `effect` quando quero **fazer algo** fora do Angular quando um valor muda (gravar no localStorage). Se eu usasse `effect` para calcular o total e jogar em outro signal, estaria duplicando estado e abrindo espaço para ficar dessincronizado.

---

## 3. HttpClient + catchError (e o catálogo local de reserva)

**O que é.** `HttpClient` faz as requisições e devolve Observables. `catchError` é um operador do RxJS que intercepta o erro e permite devolver outro Observable no lugar.

**Por que usei.** No TP original, se a API caísse, o `catchError` devolvia uma lista vazia e a tela dizia "Nenhum produto em promoção encontrado": a pessoa nunca sabia que era erro. Agora:

1. tento a Fake Store API (com `timeout` de 8 s);
2. se falhar, o `catchError` busca a cópia local `src/assets/produtos.json` (mesmos campos da API) e o service marca `origem = 'local'`, e a tela mostra um aviso;
3. se a cópia local também falhar, o erro chega ao componente, que mostra "Não foi possível carregar os produtos" com o botão **Tentar de novo**.

A lista fica guardada no service com `shareReplay(1)`: home, catálogo e cadastro usam a mesma resposta, sem refazer a requisição a cada troca de página. Se der erro, o `shareReplay` não guarda o erro, então a próxima chamada tenta de novo; o botão "Tentar de novo" força uma busca nova com `listar(true)`. Se a lista guardada for a cópia local, ela vale por 1 minuto: depois disso a próxima chamada tenta a API de novo, para a loja não ficar presa na cópia quando a API voltar.

O signal `origem` fala **só da lista do catálogo**. Quem muda o valor é o `listar()`; o `buscarPorId()` (detalhe) não mexe nele. Antes os dois escreviam no mesmo signal, e abrir um produto apagava (ou mostrava sem motivo) o aviso de cópia local no catálogo.

Também tipei a resposta (`ProdutoApi`) no lugar do `any` e converto para o formato da loja num lugar só (`ProdutoMapper`).

**Onde.** `features/produtos/produto.service.ts`, `model/produto.ts`.

**Pergunta para treinar.** *"Onde você trata erro de HTTP: no service ou no componente?"*
Ideia da resposta: depende de quem sabe o que fazer com o erro. O **service** sabe que existe uma cópia local, então ele trata a falha da API. O **componente** sabe como mostrar o erro para a pessoa, então ele trata o caso em que nem a cópia local funcionou. Engolir o erro devolvendo `[]` esconde o problema.

---

## 4. Formulários reativos

**O que é.** No formulário reativo o modelo do formulário fica no TypeScript (`FormBuilder`, `FormGroup`, `Validators`) e o HTML só se liga a ele com `formControlName`.

**Por que usei.** O cadastro do TP era template-driven (`ngModel`) e nem abria: vírgulas soltas nos atributos quebravam o template. Reescrevi como reativo porque:

- as regras ficam juntas e testáveis (`Validators.required`, `minLength`, `pattern`);
- dá para mudar validação em tempo de execução (a "nova categoria" só é obrigatória quando a pessoa escolhe "Outra");
- `valueChanges` alimenta a **prévia do card** enquanto a pessoa digita;
- uso `fb.nonNullable` para o `reset()` voltar aos valores iniciais em vez de `null`.

No checkout: e-mail com `Validators.email`, CEP com `pattern` e uma diretiva de máscara (`00000-000`). O erro aparece quando a pessoa sai do campo ou tenta enviar; ao enviar com erro, o foco vai para o primeiro campo inválido, e cada campo tem `aria-invalid` e `aria-describedby` apontando para a mensagem.

**Onde.** `features/produtos/produto-form/`, `features/carrinho/checkout/`, `shared/diretivas/mascara-cep.ts`.

**Pergunta para treinar.** *"Template-driven ou reativo? Por quê?"*
Ideia da resposta: template-driven serve para formulários bem simples. Reativo é melhor quando há validação condicional, valores derivados ou testes, porque a lógica fica em TypeScript, tipada e fácil de testar sem renderizar o HTML.

---

## 5. Lazy loading de rotas (e título por rota, 404)

**O que é.** Com `loadComponent: () => import('./...')` o código de uma página só é baixado quando alguém entra nela.

**Por que usei.** O build mostra cada página num arquivo separado (checkout, detalhe, cadastro...). Quem só olha a home não baixa o código do checkout. Junto com isso:

- cada rota tem `title`, e uma `TitleStrategy` própria acrescenta " | Vitrine" (o detalhe troca o título pelo nome do produto);
- a rota `**` agora abre uma **página 404 de verdade**, em vez de redirecionar para a home sem explicar nada;
- um *guard* funcional (`carrinhoComItensGuard`) impede abrir o checkout com o carrinho vazio;
- `withComponentInputBinding()` faz o `:id` e os query params (`?categoria=joias`) chegarem como `input()` no componente. Os filtros do catálogo moram na URL: dá para compartilhar o link e o botão Voltar funciona.

**Onde.** `app.routes.ts`, `app.config.ts`, `core/titulo-pagina.strategy.ts`, `features/carrinho/carrinho-com-itens.guard.ts`.

O `withPreloading(PreloadAllModules)` (baixar todas as páginas em segundo plano) foi testado e retirado: os arquivos extras disputavam a rede com as fotos logo na abertura da página.

**Pergunta para treinar.** *"Por que guardar os filtros na URL e não num signal do componente?"*
Ideia da resposta: a URL já é um estado que o navegador sabe guardar, compartilhar e voltar. Se o filtro estivesse só na memória, recarregar a página ou mandar o link para alguém perderia o filtro.

---

## 6. Pipes

**O que é.** Pipe transforma um valor só para exibição no template: `{{ preco | desconto: 10 | currency: 'BRL' }}`.

**Por que usei.** Mantive os dois pipes do TP e corrigi um bug: o `desconto` arredondava para o valor inteiro (98,95 virava 99). Agora a conta fica numa função do model (`aplicarDesconto`) usada pelo pipe **e** pelo carrinho, para o preço da tela e o do total nunca divergirem. São pipes `pure`: o Angular só recalcula quando o valor de entrada muda. Também configurei `LOCALE_ID = 'pt-BR'` e `DEFAULT_CURRENCY_CODE = 'USD'`: o `currency` mostra "US$ 1.299,90", no formato brasileiro e na moeda real dos preços da Fake Store API (dólar).

**Onde.** `shared/pipes/desconto-pipe.ts`, `shared/pipes/truncar-pipe.ts`, `model/produto.ts`.

**Pergunta para treinar.** *"O que é um pipe puro e por que isso importa para performance?"*
Ideia da resposta: pipe puro só roda de novo quando a referência do valor de entrada muda. Se fosse impuro, rodaria a cada ciclo de detecção de mudanças.

---

## 7. Testes com HttpTestingController

**O que é.** `provideHttpClientTesting()` troca o `HttpClient` real por um dublê. Com o `HttpTestingController` o teste diz qual requisição espera (`expectOne(url)`) e qual resposta ela recebe (`flush(dados)` ou `error(...)`). Nada sai para a internet.

**Por que usei.** Para testar exatamente os caminhos difíceis de reproduzir na mão: API respondendo, API caindo e o catálogo local assumindo, os dois falhando. O `afterEach(() => http.verify())` garante que nenhuma requisição ficou sem resposta.

Além do `ProdutoService`, testei o `CarrinhoService` (adicionar, somar, máximo de 10, remover, totais com desconto, frete grátis a partir de US$ 299, persistência no localStorage com `TestBed.tick()` para rodar o `effect`), os pipes, os filtros do catálogo, a máscara de CEP, o guard e os componentes principais. São 122 testes de unidade; no TP eram 15, e 9 falhavam.

Além deles, `npm run e2e` roda 8 testes de ponta a ponta com o **Playwright** (o fluxo completo de compra em 1440 px e 390 px, o cadastro, a página 404 e a loja com a API fora do ar). A API é simulada com `page.route()`, e o **axe-core** verifica a acessibilidade em cada tela.

**Onde.** `*.spec.ts` ao lado de cada arquivo; rodo com `npm test` (ou `npm run test:ci` sem janela).

**Pergunta para treinar.** *"Como você testa um service que faz requisição HTTP sem chamar a API de verdade?"*
Ideia da resposta: `provideHttpClient()` + `provideHttpClientTesting()` no TestBed, `expectOne` para conferir URL e método, `flush` para simular a resposta, e `verify` no final.

---

## Outras decisões que podem aparecer na conversa

| Decisão | Por quê | Onde |
|---|---|---|
| Estoque e promoção com regra fixa por id | O TP usava `Math.random()`: o mesmo produto aparecia "Esgotado" num reload e disponível no outro. A Fake Store API não tem estoque, então simulo de forma previsível e testável. | `model/produto.ts` |
| `NgOptimizedImage` | Lazy loading por padrão e `priority` nas imagens que aparecem logo de cara (a imagem principal aparece mais cedo). | `card-produto`, `banner`, `galeria-produto` |
| Card como componente de apresentação | O card recebe `input()` e avisa com `output()`; quem decide adicionar ao carrinho é a página. Fica reutilizável (a prévia do cadastro usa o mesmo card). | `card-produto.ts` |
| Tokens de design em `:root` | Cores, espaços (8/16/24/40/64), raio e sombra num lugar só; os componentes só usam variáveis. | `src/styles.css` |
| Acessibilidade | Link "Pular para o conteúdo", foco visível, alvos de toque ≥ 44 px, `aria-live` nos avisos, `lang="en"` nos textos que vêm da API em inglês. O `npm run e2e` roda o axe em cada tela. | vários |
| `ChangeDetectionStrategy.OnPush` | Com OnPush o Angular só revisa o componente quando um `input` muda, um evento acontece nele ou um signal lido no template muda. Como o estado está em signals, dá para usar em todos os componentes sem mudar a lógica. | todos os `@Component` |
| Carrinho atualizado com o catálogo atual | O carrinho salvo guarda uma cópia do produto. Ao abrir o carrinho ou o checkout, `atualizarProdutos()` troca a cópia pelo produto atual (preço, promoção, estoque) e tira o que esgotou. | `carrinho.service.ts`, `atualizar-carrinho.ts` |
| `adicionar()` devolve quantas unidades entraram | Com limite de 10 por produto, a tela precisa saber se algo entrou de fato para não mostrar "adicionado" quando nada mudou. | `carrinho.service.ts` |
| `min-height` no `<main>` | Sem ele o rodapé aparecia no topo e "pulava" para baixo quando a página carregava (mudança de layout, o CLS). | `app.css` |

**Pergunta extra.** *"O que você faria diferente se fosse um projeto de verdade?"*
Ideia da resposta: checkout e preço validados no servidor (nunca confiar no total calculado no navegador), API própria com estoque real, imagens servidas por uma CDN que redimensiona, e testes de ponta a ponta rodando no CI.
