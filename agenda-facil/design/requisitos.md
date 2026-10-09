# Requisitos priorizados (MoSCoW)

Este é o backlog da Parte 2 (o produto full stack). A prioridade é **provisória**: saiu das [hipóteses](pesquisa/hipoteses.md), do [benchmark](pesquisa/benchmark.md) e da avaliação dos meus wireframes, não de entrevistas. Quando as entrevistas acontecerem, revejo a ordem.

<!-- TODO(Beatriz): revisar as prioridades depois das 6 entrevistas. -->

- **Must**: sem isso o MVP não resolve o problema.
- **Should**: importante, mas o MVP funciona sem; entra logo depois.
- **Could**: bom ter, se sobrar tempo.
- **Won't (agora)**: decidi não fazer nesta versão, e anoto o porquê.

## Cliente final (página pública)

| ID | História | Prioridade | Critérios de aceite | Hipótese |
|---|---|---|---|---|
| C-01 | Como cliente, quero ver os serviços com duração e preço, para saber o que vou pagar antes de marcar. | Must | Cada serviço mostra nome, duração em minutos e preço em R$; serviço sem preço mostra "preço no local". | H4 |
| C-02 | Como cliente, quero escolher com quem vou ser atendido ou deixar "Sem preferência". | Must | "Sem preferência" é a primeira opção; o passo some se o negócio tem só 1 profissional. | H8 |
| C-03 | Como cliente, quero ver só os horários livres de um dia, para não escolher um horário que não existe. | Must | Horário ocupado ou bloqueado não aparece; o primeiro dia com horário livre já vem selecionado; dia sem horário mostra o próximo dia com horário. | H4 |
| C-04 | Como cliente, quero marcar só com nome e WhatsApp, sem criar conta nem baixar app. | Must | Dois campos; WhatsApp com máscara (00) 00000-0000; erro diz como corrigir; nada de senha. | H5, H6 |
| C-05 | Como cliente, quero ver um resumo antes de confirmar e poder alterar qualquer parte. | Must | Resumo com serviço, profissional, dia, hora, preço e endereço; "Alterar" volta ao passo certo sem perder o resto. | nenhuma |
| C-06 | Como cliente, quero ter certeza de que o horário é meu quando vejo a confirmação. | Must | Se duas pessoas confirmam o mesmo horário ao mesmo tempo, só a primeira consegue; a segunda vê os horários mais próximos. | H2 |
| C-07 | Como cliente, quero um comprovante com o que marquei e um jeito de remarcar ou cancelar. | Must | Tela "Horário marcado" com cartão do horário e link "Meu horário". | H3 |
| C-08 | Como cliente, quero cancelar ou remarcar pelo link, sem precisar mandar mensagem. | Should | Respeita a antecedência mínima definida pelo dono; fora do prazo, mostra o contato do negócio. | H3 |
| C-09 | Como cliente, quero salvar o horário na agenda do celular. | Should | Botão gera um arquivo .ics com dia, hora, duração, endereço. | H3 |
| C-10 | Como cliente, quero mandar o comprovante para mim no WhatsApp. | Should | Abre o WhatsApp com o texto pronto (link `wa.me`), sem API paga. | H3 |
| C-11 | Como cliente, quero receber um lembrete antes do horário. | Could | Lembrete automático por WhatsApp exige a API oficial, que é paga. Avaliar custo antes. | H9 |
| C-12 | Como cliente, quero marcar mais de um serviço de uma vez (corte e barba). | Could | No MVP, o dono pode cadastrar o combo como um serviço só. | nenhuma |
| C-13 | Como jogador, quero reservar a mesma quadra toda semana. | Could | Agendamento recorrente; depende de entrevistar donos de quadra. | nenhuma |

## Dono do negócio (painel)

| ID | História | Prioridade | Critérios de aceite | Hipótese |
|---|---|---|---|---|
| D-01 | Como dono, quero criar minha agenda em poucos minutos. | Must | 3 passos (negócio, serviços, horários e equipe) com sugestões já preenchidas pelo tipo de negócio. | nenhuma |
| D-02 | Como dono, quero cadastrar meus serviços com duração e preço. | Must | Criar, editar, remover; duração em múltiplos de 5 min. | nenhuma |
| D-03 | Como dono, quero definir os dias e horários em que atendo e quem atende. | Must | Dias da semana, abertura, fechamento, intervalo; lista de profissionais. | nenhuma |
| D-04 | Como dono, quero um link para divulgar no Instagram e no WhatsApp. | Must | Endereço curto com o nome do negócio; copiar com 1 toque; aviso "Link copiado". | H4 |
| D-05 | Como dono, quero ver a agenda do dia, para saber como vai ser o meu dia. | Must | Grade por profissional, em linhas de 30 min; status escrito (não só cor); navegar entre dias. | H2 |
| D-06 | Como dono, quero cancelar um agendamento e avisar o cliente. | Must | Janela de confirmação; motivo opcional; opção de abrir o WhatsApp com mensagem pronta; "Desfazer" por alguns segundos; o horário volta a ficar livre. | nenhuma |
| D-07 | Como dono, quero bloquear um horário (almoço, folga, compromisso). | Must | Escolher profissional, dia, início, fim e motivo; avisa se já existe agendamento no intervalo. | H2 |
| D-08 | Como dono, quero adicionar um agendamento de quem ligou ou chegou no balcão. | Must | Mesmo formulário do cliente (nome e WhatsApp opcionais). Sem isso, a agenda online e o caderno brigam. | H2 |
| D-09 | Como dono, quero pedir a confirmação do cliente e marcar quem confirmou. | Should | Botão abre o WhatsApp com mensagem pronta; status "Confirmado" na agenda. | H3 |
| D-10 | Como dono, quero ver a agenda do dia no celular. | Should (sobe para Must se H7 for confirmada) | Lista do dia por horário; mesmas ações da versão de computador. | H7 |
| D-11 | Como dono, quero um QR code do meu link para imprimir. | Should | Download em PNG e SVG. | nenhuma |
| D-12 | Como dono, quero definir com quanta antecedência o cliente pode marcar e cancelar. | Should | Ex.: marcar até 1 h antes; cancelar até 2 h antes. | H3 |
| D-13 | Como dono, quero horários diferentes para cada profissional. | Should | Cada profissional herda o horário do negócio e pode ter exceções. | nenhuma |
| D-14 | Como dono, quero aprovar cada pedido antes de ele virar agendamento. | Could | Opção desligada por padrão (aprovar tudo à mão volta a prender o dono no celular). | H6 |
| D-15 | Como dono, quero marcar falta e ver o histórico de cada cliente. | Could | Status "Faltou"; contagem de faltas por cliente. | H3 |
| D-16 | Como dono, quero cobrar um sinal por Pix para reduzir faltas. | Could | Depende de integração de pagamento. | H3 |

## Won't (nesta versão)

| O quê | Por quê |
|---|---|
| App nativo (Android/iOS) | O link no navegador resolve para o cliente e não pede instalação. |
| Marketplace com vários negócios | O foco é o negócio divulgar o próprio link, não competir numa vitrine. |
| Pagamento online completo | Aumenta o escopo (estorno, taxas, segurança) antes de provar o básico. |
| Chat dentro do Agenda Fácil | O WhatsApp já é onde a conversa acontece. |
| Várias unidades por negócio | O público é o negócio pequeno, de um endereço. |

## Requisitos não funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| N-01 | Acessibilidade WCAG 2.2 nível AA (contraste, teclado, leitor de tela, alvos de toque de 44 px ou mais). Ver [acessibilidade.md](acessibilidade.md). | Must |
| N-02 | Página pública rápida em celular com 4G e sem login. | Must |
| N-03 | LGPD: pedir só nome e WhatsApp, dizer para que servem, permitir ao cliente cancelar e pedir exclusão dos dados. | Must |
| N-04 | Horários sempre no fuso do negócio (ex.: America/Sao_Paulo), mesmo se o cliente estiver em outro fuso. | Must |
| N-05 | Dois agendamentos nunca ocupam o mesmo horário do mesmo profissional (regra garantida no banco de dados, não só na tela). | Must |
