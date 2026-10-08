# Roteiro de entrevista

> **Status: entrevistas ainda não feitas.**
> TODO(Beatriz): entrevistar 3 donos de negócio e 3 clientes.

## Objetivo

Entender como pequenos negócios de serviço marcam horário **hoje** e onde isso dá errado, antes de decidir o que o Agenda Fácil precisa ter. Quero testar as crenças das [proto-personas](proto-personas.md), não vender a ideia.

## Quem entrevistar

| Grupo | Quantas pessoas | Perfil |
|---|---|---|
| Donos | 3 | Donos ou responsáveis pela agenda de salão, barbearia, estética ou quadra. De preferência negócios diferentes entre si. |
| Clientes | 3 | Pessoas que marcaram horário em algum desses lugares nos últimos 2 meses. |

**Caso real:** se o cliente do meu freela tiver um negócio de serviço, ele é um ótimo primeiro entrevistado (Dono A). Não escrevo o nome dele, nem do negócio, em nenhum arquivo até ele autorizar por escrito.
TODO(Beatriz): perguntar ao cliente do freela se ele topa participar e se autoriza citar o negócio no case.

**Cuidado com o viés:** quem já tem relação comigo (como o cliente do freela, ou amigos) tende a responder com educação. Por isso: entrevista primeiro e protótipo só no fim, nunca o contrário; na síntese, anotar quais participantes são conhecidos; e "nada mudou" também é um resultado válido, que vai para o case do jeito que veio.

## Como conduzir

- **Duração:** 30 minutos. Presencial (melhor: dá para ver o caderno, o celular, o balcão) ou chamada de vídeo.
- **Consentimento antes de começar** (ler em voz alta):
  > "Estou estudando como as pessoas marcam horário em negócios de serviço, para um projeto de portfólio. Não estou vendendo nada. Posso gravar o áudio só para eu não perder nada do que você disser? A gravação fica só comigo e eu apago depois de transcrever. No meu trabalho você aparece como 'Dono A' ou 'Cliente A', sem nome. Você pode parar quando quiser."
- **Sem gravação se a pessoa não quiser.** Nesse caso, anoto à mão.
- **Não mostro o protótipo na entrevista.** Entrevista é para entender o problema; o protótipo vai para o [teste de usabilidade](../testes-usabilidade.md), em outro momento.
- **Perguntas sobre o passado, não sobre o futuro.** "Me conta a última vez que..." dá fatos. "Você usaria um app que...?" dá gentileza: quase todo mundo diz sim.
- **Perguntas de aprofundamento** para usar em qualquer resposta: "Por quê?", "E o que aconteceu depois?", "Me dá um exemplo?", "Como você se sentiu?". E silêncio: esperar 3 segundos antes da próxima pergunta.
- **Não completar a frase da pessoa** nem sugerir resposta.

---

## Roteiro dos donos (D1 a D10)

Aquecimento (não entra na síntese): "Me conta um pouco do seu negócio: há quanto tempo existe, o que vocês fazem, quantas pessoas trabalham aqui?"

1. **D1.** Me conta como é um dia normal aqui, do momento em que você abre até a hora de fechar.
2. **D2.** Pensa na última vez que um cliente marcou horário com você. Como foi, desde a primeira mensagem ou ligação até o atendimento?
3. **D3.** Quando chega um pedido de horário enquanto você está atendendo alguém, o que acontece?
4. **D4.** Onde você anota os horários marcados? Se puder, me mostra como fica.
5. **D5.** Me conta de uma vez em que deu problema com um horário: um esquecimento, duas pessoas no mesmo horário, alguém que não apareceu. O que aconteceu depois?
6. **D6.** Quando um cliente novo marca horário, o que você precisa saber dele para ficar tranquila de que ele vem?
7. **D7.** Você já usou ou testou algum aplicativo ou sistema de agenda? Como foi? O que te fez continuar ou parar?
8. **D8.** Para cuidar do negócio no dia a dia, você usa mais o celular ou o computador? Onde fica o seu celular enquanto você atende?
9. **D9.** Além de você, quem mais mexe na agenda?
10. **D10.** Se você pudesse mudar uma coisa no jeito como os clientes marcam horário hoje, o que seria? Por quê?

Fechamento: "Tem alguma coisa sobre agenda e horários que eu não perguntei e você acha importante?" e "Você conhece outro dono de negócio que toparia conversar comigo?"

---

## Roteiro dos clientes (C1 a C10)

Aquecimento (não entra na síntese): "Que tipo de lugar você costuma frequentar para cuidar do cabelo, da barba, da pele, ou para jogar bola?"

1. **C1.** Me conta a última vez que você marcou horário num salão, barbearia, estética ou quadra. Como foi?
2. **C2.** Em que momento do dia você costuma marcar? Onde você estava da última vez?
3. **C3.** O que você faz quando o lugar demora para responder?
4. **C4.** Você já deixou de ir a um lugar, ou trocou de lugar, por causa do jeito de marcar horário? Me conta.
5. **C5.** Você já marcou horário por algum aplicativo ou site? Como foi? Teve alguma parte chata?
6. **C6.** O que você precisa saber antes de confirmar um horário?
7. **C7.** Depois de marcar, como você lembra do horário? Já aconteceu de esquecer?
8. **C8.** Da última vez que você precisou desmarcar ou mudar um horário, como fez?
9. **C9.** Como você se sente passando o seu número de WhatsApp para um negócio?
10. **C10.** Fazer o serviço com uma pessoa específica faz diferença para você? Por quê?

Fechamento: "Tem algo sobre marcar horário que eu não perguntei e você acha importante?"

---

## Depois de cada entrevista: síntese

Até 24 horas depois da conversa, enquanto ainda lembro:

1. Releio as anotações (ou a transcrição) e preencho a [planilha de síntese](sintese.csv), **uma linha por dor**:

   | Coluna | O que vai nela |
   |---|---|
   | `participante` | Código, nunca o nome: `Dono A`, `Dono B`, `Cliente A`... |
   | `perfil` | Tipo de negócio e papel. Ex.: "barbearia, dono que também atende". |
   | `dor` | O problema, com as minhas palavras, em uma frase. |
   | `citação` | A frase exata da pessoa, entre aspas. Se não for exata, deixo vazio. |
   | `frequência` | Quantas pessoas, de todas as entrevistadas, falaram dessa mesma dor. Preencho no fim, quando juntar tudo. |
   | `oportunidade` | O que o Agenda Fácil poderia fazer sobre isso, como pergunta: "Como poderíamos...?" |

2. Depois das 6 entrevistas: agrupo as dores parecidas (mapa de afinidade), preencho a coluna `frequência` e atualizo o status de cada hipótese em [hipoteses.md](hipoteses.md): **confirmada**, **refutada** ou **sem evidência suficiente**.
3. Reescrevo as proto-personas com o que ouvi e reviso os [requisitos](../requisitos.md): o que nenhuma entrevista sustentou desce de prioridade.

**Abrir a planilha:** no Google Planilhas, *Arquivo > Importar*. No Excel, *Dados > De Texto/CSV*, com codificação UTF-8 e separador vírgula (se abrir com dois cliques, o Excel em português pode juntar tudo numa coluna só).
