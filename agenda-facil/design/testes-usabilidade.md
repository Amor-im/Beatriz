# Teste de usabilidade

> **Status: roteiro pronto, teste ainda não feito. Nenhum resultado abaixo é real.**
> TODO(Beatriz): rodar o teste com 5 pessoas (3 clientes e 2 donos de negócio) e preencher a seção "Resultados".

## Objetivo

Ver se pessoas que nunca viram o Agenda Fácil conseguem marcar, remarcar e cuidar da agenda **sozinhas**, e onde elas travam. Não é para saber se gostaram; é para ver onde o design falha.

## Como

- **Quem:** 5 pessoas. As 3 primeiras fazem as tarefas do cliente (1 a 3); os 2 donos de negócio fazem as tarefas do dono (4 e 5). Ninguém da área de tecnologia, se der.
- **Onde:** no celular da própria pessoa para o cliente (abrindo [`prototipo/cliente/index.html`](prototipo/cliente/index.html) ou o link publicado, quando houver) e num computador para o dono ([`prototipo/painel/agenda.html`](prototipo/painel/agenda.html)).
- **Duração:** 20 a 30 minutos por pessoa.
- **Método:** "pensar em voz alta". Eu leio a tarefa, a pessoa faz e vai falando o que pensa. Eu **não ajudo**: se perguntarem "e agora?", devolvo "o que você faria se eu não estivesse aqui?".
- **Registro:** gravo a tela só com autorização (mesmo texto de consentimento do [roteiro de entrevista](pesquisa/roteiro-entrevista.md)). Anoto tempo, erros e frases marcantes.

Antes de começar: "Estou testando o site, não você. Se algo for difícil, a culpa é do site, e é exatamente isso que eu preciso descobrir."

## As 5 tarefas

Cada tarefa é um cenário, sem dizer onde tocar.

### Tarefa 1 · Marcar um horário (cliente)
> "Você quer cortar o cabelo hoje, no fim da tarde, com a Rafa. A barbearia te mandou este link. Marque o horário."

| Critério de sucesso | Meta |
|---|---|
| Chega na tela "Horário marcado" com corte, Rafa, hoje, à tarde | Sem ajuda |
| Tempo | Até 90 segundos |
| Toques fora do caminho (voltar, tocar em algo errado) | No máximo 1 |
| Ao final, consegue dizer dia, hora e endereço sem olhar a tela de novo? | Sim |

### Tarefa 2 · Perceber e corrigir uma escolha errada (cliente)
> "Ops: você queria barba, não corte. Antes de confirmar, troque."

Começa na tela "Confira e confirme", já com corte escolhido.

| Critério de sucesso | Meta |
|---|---|
| Encontra e usa o "Alterar" do serviço | Sem ajuda |
| Termina com barba no resumo, sem perder o dia e a hora | Sim |
| Tempo | Até 45 segundos |

O que observar: escolher e já avançar (sem botão "Próximo") deixa a pessoa insegura? Ela confia no resumo?

### Tarefa 3 · Cancelar o horário marcado (cliente)
> "Surgiu um imprevisto. Cancele o horário que você marcou."

Começa na tela "Horário marcado".

| Critério de sucesso | Meta |
|---|---|
| Chega em "Meu horário" e confirma o cancelamento | Sem ajuda |
| Entende que o horário foi cancelado (pergunto: "e agora, o horário ainda é seu?") | Responde que não |
| Tempo | Até 60 segundos |

### Tarefa 4 · Confirmar e cancelar no dia (dono)
> "Você é o dono da barbearia. O Lucas, das 16:20, ainda não confirmou. Peça a confirmação dele. Depois, imagine que o Renato, das 14:40, avisou que não vem: tire ele da agenda."

| Critério de sucesso | Meta |
|---|---|
| Acha o Lucas e usa "Pedir confirmação no WhatsApp" | Sem ajuda |
| Cancela o Renato pela janela de confirmação | Sem ajuda |
| Entende que pode desfazer (pergunto depois: "e se tivesse sido sem querer?") | Aponta o "Desfazer" |
| Tempo total | Até 2 minutos |

### Tarefa 5 · Bloquear um horário (dono)
> "Amanhã a Rafa tem médico das 15h às 16h. Faça com que ninguém consiga marcar com ela nesse horário."

| Critério de sucesso | Meta |
|---|---|
| Abre "Bloquear horário" e preenche profissional, horário e (se quiser) motivo | Sem ajuda |
| Se aparecer o aviso de conflito, entende o que fazer | Explica com as próprias palavras |
| Tempo | Até 90 segundos |

## Depois das tarefas

Três perguntas abertas:
1. "O que foi mais fácil? E o mais difícil?"
2. "Teve algum momento em que você não sabia se tinha dado certo?"
3. (Clientes) "Você marcaria por um link assim, no lugar de mandar mensagem? Por quê?" (Donos) "O que faltou para você usar isso no seu negócio amanhã?"

Para comparar entre as pessoas, peço também uma nota de 1 a 7 para "Foi fácil fazer essa tarefa?" depois de cada tarefa (a pergunta SEQ, Single Ease Question).

## Como vou analisar

- **Taxa de sucesso** por tarefa: quantas das pessoas conseguiram sozinhas.
- **Tempo** de cada tarefa comparado com a meta.
- **Problemas:** cada travada vira uma linha, com a severidade da [avaliação heurística](avaliacao-heuristica.md) (S0 a S3) e quantas pessoas tiveram o mesmo problema.
- Problema que aparece em 2 pessoas ou mais vira prioridade antes da Parte 2.

## Resultados

TODO(Beatriz): preencher depois do teste. Não preencher com estimativa.

| Tarefa | Sucesso (de 5) | Tempo médio | Nota SEQ média | Principais problemas |
|---|---|---|---|---|
| 1. Marcar | TODO | TODO | TODO | TODO |
| 2. Corrigir escolha | TODO | TODO | TODO | TODO |
| 3. Cancelar | TODO | TODO | TODO | TODO |
| 4. Confirmar e cancelar (dono) | TODO | TODO | TODO | TODO |
| 5. Bloquear (dono) | TODO | TODO | TODO | TODO |

**O que mudou no design por causa do teste:** TODO(Beatriz).
