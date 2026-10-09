# ESTUDO.md · as decisões do Agenda Fácil, explicadas por mim

Este arquivo é o meu roteiro para explicar o projeto numa entrevista. Para cada decisão: **o que é**, **por que usei aqui**, **onde está** e **uma pergunta para treinar**. As respostas ficam fora do repositório: numa entrevista, vale a minha explicação, não uma frase decorada.

Por enquanto cobre a Parte 1 (o case de UX e o protótipo). A Parte 2 (o produto full stack) entra aqui quando começar.

**Como este arquivo foi feito.** Foi rascunhado com um assistente de IA (Claude Code), como o resto do case. Onde algo foi achado ou feito pela IA, está escrito assim, com um jeito de eu refazer sozinha. Só conto como meu numa entrevista o que eu refiz.

<!-- TODO(Beatriz): ler tudo em voz alta e reescrever com as minhas palavras o que soar artificial. -->

## Como uso IA neste projeto (proposta)

<!-- TODO(Beatriz): decidir esta regra e reescrevê-la com as minhas palavras. -->

- **Faço sozinha:** as entrevistas e a síntese, o texto final do case, a avaliação heurística refeita, a reprodução do bug do botão, os dois achados em aberto da avaliação e a explicação do projeto em 3 minutos.
- **A IA pode ajudar a:** explicar um conceito, revisar o que eu escrevi, sugerir casos de teste e revisar código.
- **Nos commits:** o que foi feito com ajuda de IA leva a linha `Co-Authored-By`; o que eu fiz sozinha não leva.
- **Na entrevista:** só conto como meu o que eu fiz ou refiz.

---

## Parte A · Decisões de pesquisa e de UX

### 1. Proto-persona, e não persona

**O que é.** Persona é um retrato de um grupo de usuários feito **a partir de pesquisa**. Proto-persona é o mesmo formato, mas feito **antes** da pesquisa, com o que a gente acha que sabe.

**Por que usei.** Eu ainda não entrevistei ninguém. Chamar de persona seria fingir que pesquisei. A proto-persona me ajudou a listar as crenças que preciso testar, e cada crença tem uma pergunta no roteiro.

**Onde.** `design/pesquisa/proto-personas.md` e `design/pesquisa/hipoteses.md`.

**Pergunta para treinar.** *"Como você criou as personas do projeto?"*

### 2. Perguntas sobre o passado na entrevista

**O que é.** Em vez de perguntar "você usaria um app que...?", pergunto "me conta a última vez que você marcou um horário".

**Por que usei.** Pergunta sobre o futuro dá resposta educada: quase todo mundo diz que usaria. Pergunta sobre o passado dá fatos: o que a pessoa fez, onde travou, o que sentiu.

**Onde.** `design/pesquisa/roteiro-entrevista.md`.

**Pergunta para treinar.** *"Como você evita viés numa entrevista com usuário?"*

### 3. Benchmark só com fonte pública

**O que é.** Comparar como outros apps resolvem o mesmo problema.

**Por que usei.** Para não reinventar o óbvio e achar onde os concorrentes deixam a desejar. Coloquei a fonte em cada linha porque é fácil "lembrar" de um recurso que o app nem tem. Os sites não foram abertos: cada afirmação foi conferida só no trecho que a busca devolveu, e esses trechos estão num apêndice. Abrir cada link ainda é uma tarefa minha.

**Onde.** `design/pesquisa/benchmark.md` e `benchmark-evidencias.md`.

**Pergunta para treinar.** *"O que você aprendeu com os concorrentes?"*

### 4. Avaliação heurística (as 10 heurísticas de Nielsen)

**O que é.** Uma lista de 10 princípios de usabilidade (mostrar o status do sistema, prevenir erros, deixar desfazer...). A pessoa avalia cada tela com a lista e dá uma nota.

**Por que usei.** Para criticar wireframes com método, não só "achei feio". A v1 foi feita ingênua de propósito e avaliada com o assistente de IA: saíram 12 problemas, e os mais graves foram corrigidos na versão de alta fidelidade.

**Como refazer sozinha.** Avaliar a v1 com a lista antes de ler a avaliação da IA e comparar o que cada uma achou.

**Onde.** `design/avaliacao-heuristica.md`.

**Pergunta para treinar.** *"Avaliação heurística substitui teste com usuário?"*

### 5. MoSCoW e histórias de usuário

**O que é.** MoSCoW separa requisitos em Must (sem isso não resolve o problema), Should, Could e Won't (agora não). História de usuário é o formato "Como [quem], quero [o quê], para [por quê]", com critérios de aceite.

**Por que usei.** Para a Parte 2 ter um backlog com prioridade, e para eu conseguir justificar por que algo ficou de fora (ex.: lembrete automático por WhatsApp é Could porque a API oficial é paga).

**Onde.** `design/requisitos.md`.

**Pergunta para treinar.** *"Como você decidiu o que entra no MVP?"*

### 6. Menos passos: "escolher já avança"

**O que é.** Tocar num serviço, num profissional ou num horário leva direto ao próximo passo, sem botão "Próximo".

**Por que usei.** Na v1 eram 11 toques e 4 campos para marcar um corte; agora são 3 ou 4 toques e 2 campos. O risco é a pessoa tocar errado, então o passo final mostra um resumo com "Alterar" em cada item.

**Onde.** `design/prototipo/cliente/` e a tabela de fricção em `design/avaliacao-heuristica.md`.

**Pergunta para treinar.** *"Tirar o botão 'Próximo' não deixa o usuário inseguro?"*

### 7. Cliente sem conta, identificado pelo WhatsApp

**O que é.** O cliente marca só com nome e WhatsApp. Para remarcar ou cancelar, usa o link "Meu horário" que vem no comprovante.

**Por que usei.** Criar conta para cortar o cabelo é atrito (hipótese H5), e os apps do benchmark pedem cadastro. O link funciona como uma "chave" do agendamento.

**Pergunta para treinar.** *"E se alguém marcar com um número falso?"*

---

## Parte B · Decisões técnicas do protótipo

### 8. HTML, CSS e um pouco de JavaScript, sem framework

**O que é.** O protótipo é feito de páginas HTML estáticas. Cada passo do fluxo é um arquivo.

**Por que usei.** Abre com dois cliques, sem instalar nada, e posso testar no celular de verdade de outra pessoa. Também consigo verificar acessibilidade com ferramenta, o que no Figma não dá. Na Parte 2, o produto vai ter framework; aqui eu queria focar no design.

**Onde.** `design/prototipo/`.

**Pergunta para treinar.** *"Por que não fez o protótipo só no Figma?"*

### 9. Tokens em variáveis CSS

**O que é.** Variáveis CSS (`--caneta: #2340c2;`) definidas uma vez em `:root` e usadas em todo lugar com `var(--caneta)`.

**Por que usei.** Se eu mudar a cor das ações, muda em todo o protótipo. Os nomes vêm do mundo do produto (tinta, papel, caneta, marca-texto) para eu lembrar para que serve cada cor, e não só qual é a cor.

**Onde.** `design/prototipo/estilos/tokens.css`.

**Pergunta para treinar.** *"O que é um design token?"*

### 10. Mostrar o dia escolhido só com CSS (`:has()`)

**O que é.** Os dias são botões de rádio. O seletor `:has()` deixa o CSS perguntar "este bloco tem um rádio marcado?" e mostrar só os horários daquele dia.

**Por que usei.** Funciona sem JavaScript e com teclado (as setas trocam o dia), porque usa um rádio de verdade.

**Onde.** `design/prototipo/estilos/telas.css` (busque por `horarios-do-dia`).

**Pergunta para treinar.** *"Por que rádio e não botões comuns para os dias?"*

### 11. As escolhas viajam no endereço da página

**O que é.** `profissional.html?servico=corte` → `horario.html?servico=corte&profissional=rafa`. O JavaScript lê com `URLSearchParams` e repassa para o próximo link.

**Por que usei.** O botão Voltar do navegador funciona, dá para abrir qualquer passo já preenchido (útil para teste e para os prints) e eu não preciso guardar nada no navegador.

**Onde.** `design/prototipo/js/cliente.js`, parte 1.

**Pergunta para treinar.** *"Por que não usar localStorage?"*

### 12. Validação de formulário acessível

**O que é.** Rótulo sempre visível, erro embaixo do campo, `aria-invalid="true"` no campo errado e `aria-describedby` ligando o campo à mensagem. Ao enviar com erro, o foco vai para o primeiro campo errado.

**Por que usei.** Quem usa leitor de tela ouve o rótulo, a dica e o erro juntos. Quem enxerga sabe qual campo corrigir e como.

**Onde.** `design/prototipo/cliente/dados.html` e `js/cliente.js`.

**Pergunta para treinar.** *"Quando você mostra o erro de um campo?"*

### 13. O bug do botão que fugia do dedo

**O que é.** Ao tocar em "Confirmar agendamento" com o WhatsApp pela metade, o campo perdia o foco, a mensagem de erro aparecia, o botão descia uns pixels e o toque caía fora dele. Nada acontecia.

**Como foi achado.** O script de prints, escrito pelo assistente de IA, tentou exatamente isso e o resultado veio errado. Investigando, a IA viu que o clique nunca chegava ao botão.

**Como foi resolvido.** Quando a pessoa encosta no botão (`pointerdown`, que acontece antes do campo perder o foco), o código marca que ela está indo enviar. Nesse caso, a validação do campo espera o envio, que mostra todos os erros de uma vez. Ficou um teste para o bug não voltar.

**Como refazer sozinha.** Apagar a linha `botao.addEventListener('pointerdown', ...)` em `js/cliente.js`, rodar `npm run verificar` e ver o fluxo do cliente falhar. Depois, desfazer a mudança com `git checkout` e ver o teste passar de novo. Depois, no celular, abrir `cliente/dados.html`, digitar meio WhatsApp e tocar em "Confirmar agendamento".

**Onde.** `js/cliente.js` (busque `indoEnviar`) e `ferramentas/verificar.mjs`.

**Pergunta para treinar.** *"Como um teste automático pode achar um bug de interface?"*

### 14. Janelas com o elemento `<dialog>`

**O que é.** O HTML tem um elemento próprio para janelas. Com `showModal()`, o navegador escurece o fundo, prende o foco dentro da janela e fecha com Esc.

**Por que usei.** Fazer isso na mão com `div` dá muito trabalho e quase sempre fica sem acessibilidade.

**Onde.** Janelas de cancelar, bloquear e novo agendamento em `design/prototipo/painel/agenda.html`; abrir e fechar em `js/comum.js`.

**Pergunta para treinar.** *"O que uma janela modal precisa ter para ser acessível?"*

### 15. Toast com `role="status"` e "Desfazer"

**O que é.** A mensagem curta que aparece depois de uma ação ("Agendamento de Lucas cancelado. Desfazer").

**Por que usei.** `role="status"` faz o leitor de tela anunciar a mensagem sem tirar o foco do lugar. "Desfazer" é mais gentil que perguntar "tem certeza?" para tudo; no cancelamento usei os dois, porque o cliente também é avisado.

**Onde.** `js/comum.js`, função `mostrarToast`.

**Pergunta para treinar.** *"Confirmação ou desfazer: quando usar cada um?"*

### 16. Ícones como máscara CSS

**O que é.** Cada ícone é um SVG dentro do CSS (`data:image/svg+xml,...`), usado como máscara. A cor vem de `currentColor`, então o ícone pega a cor do texto.

**Por que usei.** Funciona abrindo o arquivo direto do disco (o jeito comum, `<use href="icones.svg#x">`, é bloqueado por alguns navegadores em `file://`, o Chrome entre eles) e o HTML fica limpo: `<span class="icone icone-check" aria-hidden="true">`.

**Onde.** `design/prototipo/estilos/icones.css`.

**Pergunta para treinar.** *"Por que o ícone tem `aria-hidden`?"*

### 17. Fontes no próprio projeto

**O que é.** Os arquivos das fontes (`.woff2`) ficam em `prototipo/fontes/` e são carregados com `@font-face`.

**Por que usei.** O protótipo abre igual sem internet. As três fontes têm licença SIL Open Font License, que permite isso. A Atkinson Hyperlegible foi criada pelo Braille Institute pensando em leitores com baixa visão.

**Onde.** `design/prototipo/estilos/tokens.css` (início) e `prototipo/fontes/LICENCAS.txt`.

**Pergunta para treinar.** *"Para que serve `font-display: swap`?"*

### 18. Contraste calculado, não "no olho"

**O que é.** A WCAG define uma fórmula de contraste entre duas cores (baseada na luminância de cada uma). AA pede 4,5:1 para texto normal e 3:1 para borda de controle.

**Por que usei.** Cada par usado foi calculado (a tabela está no design system). Por exemplo, o verde marca-texto tem 1,23:1 sobre branco. Por isso ele nunca é texto, só fundo atrás do texto escuro (14:1).

**Como refazer sozinha.** Conferir dois ou três pares num verificador de contraste (o do WebAIM, por exemplo) e ver se bate com a tabela.

**Onde.** Tabela em `design/design-system.md`.

**Pergunta para treinar.** *"Como você garante que um texto é legível?"*

### 19. Alvos de toque de 44 px

**O que é.** Todo botão, link de navegação e campo tem pelo menos 44 × 44 px (uso 48 px).

**Por que usei.** Dedo não é mouse. Na v1, os dias do calendário tinham 38 px de altura e os ícones do painel, 22 px. A WCAG 2.2 pede no mínimo 24 px no nível AA e 44 px no nível AAA; segui os 44 px.

**Onde.** `--alvo-minimo` em `tokens.css`; o script mede.

**Pergunta para treinar.** *"Link no meio de um texto também precisa ter 44 px?"*

### 20. Playwright e axe-core para verificar

**O que é.** Playwright controla um navegador por código: abre a página, clica, digita, tira print. O axe-core é uma biblioteca que verifica regras de acessibilidade na página aberta.

**Por que usei.** Com 24 telas e estados, conferir tudo à mão a cada mudança é impossível. Um comando percorre os dois fluxos do início ao fim, roda o axe em cada tela e mede os alvos de toque; outro tira os prints de `design/telas/`.

**Onde.** `design/ferramentas/` (`npm run verificar`, `npm run telas`).

**Pergunta para treinar.** *"Ferramenta automática garante acessibilidade?"*

### 21. Fluxos em Mermaid

**O que é.** Mermaid é um jeito de escrever diagramas como texto (`A --> B`). O GitHub desenha sozinho.

**Por que usei.** O diagrama fica versionado no git junto com o resto: dá para ver o que mudou no fluxo num commit, como em código.

**Onde.** `design/fluxos.md`, `design/arquitetura-informacao.md`.

**Pergunta para treinar.** *"Por que desenhar o fluxo antes da tela?"*

### 22. WhatsApp pelo link `wa.me`, sem API

**O que é.** Um link `https://wa.me/?text=...` abre o WhatsApp de quem clicou com a mensagem já escrita. A pessoa só aperta enviar.

**Por que usei.** Avisar e pedir confirmação sem custo e sem integração. A API oficial do WhatsApp envia sozinha, mas é paga e exige cadastro da empresa e aprovação dos modelos de mensagem; ficou como Could no backlog.

**Onde.** `js/cliente.js` (comprovante) e a ação "Pedir confirmação" no painel.

**Pergunta para treinar.** *"Por que o lembrete automático não está no MVP?"*

### 23. Arquivo `.ics` para salvar na agenda do celular

**O que é.** `.ics` é um formato de texto padrão para eventos de calendário. Google Agenda, iPhone e Outlook abrem.

**Por que usei.** "Salvar na agenda do celular" ajuda o cliente a lembrar do horário sem eu precisar mandar lembrete.

**Onde.** `js/cliente.js`, parte 4: o arquivo é montado no navegador com `Blob`.

**Pergunta para treinar.** *"Por que o horário no .ics tem o fuso de São Paulo?"*

### 24. Dois clientes no mesmo horário (para a Parte 2)

**O que é.** Se duas pessoas confirmam o mesmo horário quase ao mesmo tempo, só uma pode ficar com ele.

**Por que usei.** No protótipo, desenhei a tela para quem perde a disputa (horários próximos, dados mantidos). No produto, a regra precisa estar no banco de dados (uma restrição que não deixa gravar dois agendamentos do mesmo profissional no mesmo horário), porque a tela sozinha não impede duas requisições simultâneas.

**Onde.** `design/prototipo/cliente/horario-ocupado.html` e o requisito N-05.

**Pergunta para treinar.** *"Validar na tela não basta?"*

### 25. Variáveis e componentes no Figma

**O que é.** No Figma, variável é o token de design (a mesma ideia do item 9) e componente é uma peça reutilizável. Variante é uma versão do mesmo componente (botão principal, secundário, desabilitado). Propriedade é o que muda a cada uso sem mudar o desenho (o texto do botão, mostrar ou não um ícone).

**Por que usei.** As cores, os espaços e os raios das telas vêm das variáveis, e as telas usam os componentes. Se eu mudar o azul-caneta na variável, ele muda em todas as telas, igual ao CSS. Cada variável mostra o nome no código (`var(--caneta)`), então quem programa sabe qual token usar.

**Onde.** No arquivo "Agenda Fácil · Case UX", página "Wireframes · UI", seção do design system.

**Pergunta para treinar.** *"Qual a diferença entre variante e propriedade de componente?"*
