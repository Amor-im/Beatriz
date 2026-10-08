# Acessibilidade no design

Meta: **WCAG 2.2, nível AA**, desde o protótipo. Prefiro decidir isso no design a corrigir depois no código.

## Como foi verificado

| Verificação | Ferramenta | Resultado |
|---|---|---|
| Regras automáticas WCAG 2.0, 2.1 e 2.2 (A e AA) em 24 telas e estados | axe-core 4.13, via [`ferramentas/verificar.mjs`](ferramentas/verificar.mjs) | 0 violações |
| Contraste de cada par de cores | Cálculo da WCAG (tabela em [design-system.md](design-system.md#contraste-conferido)) + axe | Todos os textos passam AA; bordas de controle passam 3:1 |
| Tamanho dos alvos de toque | Script mede cada controle visível | Nenhum abaixo de 44 × 44 px |
| Ordem de foco com Tab | Script aperta Tab e anota cada parada (lista abaixo) | Segue a ordem visual |
| Tela de 320 px (equivale a zoom de 400%) | Script compara a largura da página com a da tela | 12 de 12 páginas sem rolagem lateral (2 corrigidas na hora) |

O que **ainda não** foi verificado: navegação real com leitor de tela (NVDA no Windows, TalkBack no Android, VoiceOver no iPhone). Ferramenta automática pega só uma parte dos problemas.
TODO(Beatriz): fazer o fluxo do cliente inteiro com o TalkBack ligado e anotar o que for estranho.

---

## 1. Contraste AA

- Texto principal 16:1, texto secundário 7:1, links 8:1, botão principal 8:1.
- O verde marca-texto (`#D4F56A`) tem só 1,23:1 sobre branco, então **nunca é texto**: só aparece como fundo atrás da cor tinta (14:1).
- Bordas de campo, horário e chip usam `--linha-forte` (3,87:1), porque a borda é o que mostra onde o controle está.

## 2. Alvos de toque de 44 px ou mais

- Botões, horários, itens de lista e campos: **48 px** de altura (`--alvo-minimo`).
- Chips, "Voltar", "Alterar", ação do toast, links do índice: **44 px** no mínimo.
- Dias da faixa: 68 × 84 px.
- Interruptores e caixas de seleção: o rótulo inteiro é clicável e tem 48 px de altura.
- Espaço de 8 px entre horários vizinhos, para evitar tocar no errado.
- Única exceção: links no meio de uma frase ("Como usamos seus dados"), que a WCAG 2.5.8 deixa de fora.

## 3. Ordem de foco

O foco segue a ordem em que a tela é lida, de cima para baixo. Paradas registradas com Tab:

**Dia e horário (cliente):** Voltar → grupo de dias (as setas trocam o dia) → 15:00 → 16:20 → 17:00 → 18:20.

**Seus dados (cliente):** Voltar → Alterar serviço → Alterar profissional → Alterar dia e horário → Seu nome → WhatsApp → Confirmar agendamento → Como usamos seus dados.

**Agenda do dia (dono):** Pular para a agenda → logotipo → Agenda → Serviços → Horários e equipe → Meu link → Configurações → Sair → Dia anterior → Próximo dia → Bloquear horário → Novo agendamento → agendamentos da Rafa → agendamentos da Júlia → detalhes.

Ponto a observar: no painel, as ações do agendamento escolhido (confirmar, cancelar) vêm depois de todos os horários do dia. Num dia cheio, quem usa teclado aperta Tab muitas vezes até chegar nelas. Se isso aparecer no teste, a solução é levar o foco para o painel de detalhes ao escolher um agendamento.

Outras regras:
- Contorno de foco igual em tudo: azul, 3 px, com 2 px de folga. Nunca `outline: none` sem substituto.
- Janelas usam o elemento `<dialog>` com `showModal()`: o foco entra na janela, fica preso nela, Esc fecha e o foco volta para quem abriu.
- Depois de enviar um formulário com erro, o foco vai para o primeiro campo errado.
- "Pular para a agenda" é o primeiro item do painel, para quem usa teclado não passar pelo menu toda vez.

## 4. Textos de erro

Todo erro diz **o que aconteceu e como resolver**, perto do campo, sem culpar a pessoa.

| Onde | Mensagem |
|---|---|
| Nome do cliente | "Digite seu nome. É assim que a barbearia vai te chamar." |
| WhatsApp | "Digite o número com DDD, no formato (00) 00000-0000." |
| Horário que acabou de ser ocupado | "O horário das 16:20 acabou de ser reservado. Outra pessoa confirmou um pouco antes. Seu nome e WhatsApp continuam aqui." + horários próximos |
| E-mail do dono | "Digite um e-mail completo, como nome@provedor.com." |
| Senha | "A senha precisa ter pelo menos 8 caracteres." |
| Serviços | "Deixe pelo menos 1 serviço para os clientes poderem marcar." |
| Bloquear horário com agendamento no meio | "Já tem agendamento nesse intervalo: André, 15:40 (Corte). Cancele ou remarque esse horário antes, ou escolha outro intervalo." |
| Fim antes do início | "O fim precisa ser depois do início." |

No código: `aria-invalid="true"` no campo, mensagem ligada por `aria-describedby` (o leitor de tela lê o rótulo, a dica e o erro juntos), ícone com `aria-hidden="true"` porque o texto já diz tudo.

## 5. Nenhuma informação só por cor

| Informação | Cor | E também |
|---|---|---|
| Status do agendamento | Verde ou âmbar | Ícone (check ou relógio) e texto ("Confirmado", "A confirmar"); borda contínua ou tracejada na grade |
| Horário bloqueado | Cinza | Hachura, cadeado e "Bloqueado · Almoço" |
| Dia fechado ou lotado | Cinza | Borda tracejada e a palavra "fechado" ou "lotado" |
| Hoje | Marca-texto | A palavra "hoje" |
| Item escolhido (chip, dia) | Azul | Ícone de check ou borda mais grossa |
| Campo com erro | Vermelho | Borda mais grossa, ícone e mensagem escrita |
| Passo atual | Azul | "Passo 2 de 4 · Profissional" escrito |
| Agora (linha do tempo) | Azul | Etiqueta "14:10" |

## 6. Leitor de tela e estrutura

- `lang="pt-BR"` em todas as páginas.
- Um `h1` por tela e títulos em ordem; marcos `main`, `nav` e `header`.
- Rótulo visível em todo campo (o placeholder nunca é o rótulo).
- Dias da faixa: rádios de verdade, com o nome completo escondido para o leitor de tela ("Hoje, quinta-feira, 8 de outubro") no lugar de "qui 8".
- Cada agendamento da grade tem um nome completo: "16:20 às 17:00, Lucas, Corte, a confirmar".
- Toasts dentro de `role="status"`: o leitor de tela anuncia sem roubar o foco.
- Ícones decorativos com `aria-hidden="true"`; botões só de ícone com `aria-label` ("Fechar", "Remover Barba").

## 7. Movimento e zoom

- Animações curtas (120 ms) e desligadas com `prefers-reduced-motion: reduce`.
- Nada depende de passar o mouse por cima: todo hover tem equivalente no toque ou no foco.
- Textos em `rem`, campos com 16 px: o zoom do navegador funciona e o iPhone não dá zoom sozinho ao tocar num campo.
