# Agenda Fácil · case de UX

Agendamento online para pequenos negócios de serviço. O dono configura serviços e horários; o cliente marca pelo celular, por um link, sem baixar app e sem criar conta.

![Agenda Fácil: página do negócio, escolha do horário, horário marcado e agenda do dono](../docs/capa.png)

<!-- TODO(Beatriz): ler em voz alta e reescrever com as minhas palavras tudo o que não soar como eu. -->

**Em 30 segundos:**

- **Protótipo navegável** em HTML, CSS e JavaScript puro: 14 páginas e 24 estados (dia lotado, erro nos campos, horário tomado por outra pessoa no último segundo, cancelamento com "Desfazer").
- **Verificado por script:** Playwright percorre os dois fluxos do início ao fim e o axe-core não acha nenhuma violação WCAG 2.2 A ou AA. O script pegou um bug real de toque, que foi corrigido e ganhou um teste.
- **Uma regra que atravessa o projeto:** dois clientes nunca ficam com o mesmo horário. No protótipo, é a tela de quem perde a disputa; na Parte 2, vira uma regra no banco de dados.
- **Pesquisa planejada, não inventada:** ninguém foi entrevistado ainda. Tudo o que fala de pessoas é hipótese e está marcado assim; o que tem fonte pública traz o link.

## Como este case foi feito

O rascunho foi montado com um assistente de IA (Claude Code), numa sessão só, a partir de um briefing: textos, wireframes, avaliação heurística, protótipo e scripts de verificação. Os commits trazem a linha `Co-Authored-By: Claude`. Ninguém foi entrevistado e ninguém testou o protótipo ainda.

<!-- TODO(Beatriz): quando eu refizer a avaliação, reproduzir o bug, entrevistar e testar, reescrever esta seção dizendo o que eu fiz sozinha e o que veio da IA. -->

| Peça | Onde |
|---|---|
| Protótipo navegável (abre com dois cliques) | [`prototipo/index.html`](prototipo/index.html) |
| Arquivo no Figma: pesquisa, fluxos, wireframes, UI e protótipo clicável | [Agenda Fácil · Case UX](https://www.figma.com/design/KzXCAfLG2xE3x8FT3fQGRR) |
| Telas exportadas | [`telas/`](telas/) |
| Pesquisa | [`pesquisa/`](pesquisa/) |
| Design system | [design-system.md](design-system.md) |

<!-- TODO(Beatriz): conferir se o arquivo do Figma está na minha conta e tirar o "(Copy)" do nome. -->

---

## Contexto

É um projeto pessoal de portfólio, em duas partes. Esta é a Parte 1: o case de UX, do problema ao protótipo. A Parte 2 vai ser o produto full stack, construído a partir dos [requisitos](requisitos.md) que saíram daqui.

<!-- TODO(Beatriz): contar com as minhas palavras por que escolhi esse problema. Se o cliente do meu freela tiver um negócio de serviço e autorizar, ele pode ser o caso real do projeto (sem citar o nome antes da autorização). -->

## Problema

Em muito negócio pequeno de serviço, marcar horário é uma conversa de WhatsApp: o cliente pergunta se tem horário, o dono responde quando pode, os dois vão e voltam até combinar, e alguém anota num caderno. A hipótese é que isso custa caro para os dois lados: o dono para o atendimento para responder e esquece de anotar; o cliente espera, às vezes desiste, e esquece o horário.

Segundo reportagem da Agência Sebrae sobre a 12ª Pesquisa Pulso dos Pequenos Negócios (2026), oito em cada dez donos de pequenos negócios apontam o WhatsApp como o principal canal de comunicação e de vendas ([Agência Sebrae](https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/)). O dado não diz nada sobre agendamento em si; por isso as entrevistas são o próximo passo.

**A pergunta do projeto:** como o cliente pode marcar sozinho, a qualquer hora, sem trocar mensagens, sem baixar app e sem criar conta, e como o dono pode cuidar do dia sem passar o dia no celular?

## Público

Duas [proto-personas](pesquisa/proto-personas.md), sem foto de propósito, para saber o que perguntar nas entrevistas:

- **Rosa, dona de um salão pequeno** (hipótese, validar em entrevista). Atende e administra ao mesmo tempo, recebe pedidos no WhatsApp pessoal e anota num caderno.
- **Lucas, cliente** (hipótese, validar em entrevista). Marca pelo celular, muitas vezes à noite. Desistiria se tivesse que criar conta para cortar o cabelo.

Quadra esportiva deve funcionar diferente (aluguel por hora, mensalistas, grupo), por isso o passo "profissional" pode virar "quadra".

## Pesquisa

| | Status | Onde |
|---|---|---|
| Proto-personas | Hipótese | [proto-personas.md](pesquisa/proto-personas.md) |
| 9 hipóteses, com o que muda se forem falsas | Não validadas (H1 e H7 primeiro) | [hipoteses.md](pesquisa/hipoteses.md) |
| Roteiro de entrevista (10 perguntas para donos, 10 para clientes) | Pronto, não aplicado | [roteiro-entrevista.md](pesquisa/roteiro-entrevista.md) |
| Planilha de síntese | Vazia, esperando as entrevistas | [sintese.csv](pesquisa/sintese.csv) |
| Benchmark de 4 apps | Fonte em cada linha, conferido só pelo trecho da busca | [benchmark.md](pesquisa/benchmark.md) |

As perguntas do roteiro são sobre **o que a pessoa fez da última vez**, não sobre o que faria, porque quase todo mundo responde "sim" por educação.

<!-- TODO(Beatriz): entrevistar 3 donos de negócio e 3 clientes. -->
<!-- TODO(Beatriz): abrir cada link do benchmark e confirmar antes de publicar. -->

**Benchmark** (Trinks, Booksy, AppBarber e Playtomic, só com informação pública). O que mais pesou nas decisões, como interpretação:

- Nos quatro, a documentação descreve um cadastro do cliente no caminho do agendamento.
- Mudar um horário raramente é simples: no Booksy, remarcar cancela o original; na Playtomic, exige falar com o clube.
- Trinks e Booksy ensinam o dono a pôr o link de agendamento na mensagem automática do WhatsApp Business: o WhatsApp é a porta de entrada.

## Jornada atual

A [jornada de hoje](pesquisa/jornada-atual.md), como hipótese: pedir horário, esperar resposta, combinar, anotar, lembrar, desmarcar.

![Jornada atual: a conversa de ida e volta pelo WhatsApp até o horário anotado no caderno](telas/jornada-atual.png)

## Oportunidades

| Dor (hipótese) | Oportunidade |
|---|---|
| O cliente precisa perguntar o que está livre | Mostrar só os horários livres, a qualquer hora |
| O dono para o atendimento para responder | O cliente marca sozinho; o dono vê o resultado na agenda |
| Ida e volta até combinar | Escolher e reservar em 3 ou 4 toques |
| Esquecer de anotar, marcar duas pessoas no mesmo horário | A marcação já entra na agenda; o sistema não deixa dois no mesmo horário |
| Faltas sem aviso | Comprovante para salvar na agenda do celular; pedir confirmação pelo WhatsApp |
| Desmarcar dá trabalho | Link "Meu horário" para remarcar ou cancelar |

Os requisitos estão priorizados com MoSCoW em [requisitos.md](requisitos.md) e são o backlog da Parte 2.

## Fluxos

Três fluxos cobrem o MVP ([fluxos.md](fluxos.md)); o mapa de telas está em [arquitetura-informacao.md](arquitetura-informacao.md).

| Cliente agenda | Dono configura | Dono gerencia o dia |
|---|---|---|
| ![Fluxo do cliente](telas/fluxo-1-cliente-agenda.png) | ![Fluxo de configuração do dono](telas/fluxo-2-dono-configura.png) | ![Fluxo do dia do dono](telas/fluxo-3-dono-gerencia-o-dia.png) |

## Wireframes

A primeira versão é um [wireframe em baixa fidelidade](wireframes/index.html) ingênuo de propósito, no jeito mais comum de app de agendamento, feito para servir de base a uma avaliação com as 10 heurísticas de Nielsen. A avaliação foi feita com o assistente de IA e apontou 12 problemas, como horário ocupado diferente do livre só pela cor e cancelar com um ícone de lixeira, sem confirmação. A [avaliação completa](avaliacao-heuristica.md) tem cada achado com o antes e o depois.

<!-- TODO(Beatriz): avaliar a v1 sozinha com a mesma lista, antes de ler a avaliação, e comparar o que cada uma achou. -->

| Antes (v1) | Depois (v2) |
|---|---|
| <img src="telas/v1-w5-horario.png" width="260" alt="Wireframe v1: grade com horários ocupados em cinza"> | <img src="telas/cliente-3-horario.png" width="260" alt="Protótipo: só horários livres, separados por turno"> |

## Protótipo

Em **HTML e CSS estáticos**, com um pouco de JavaScript, em [`prototipo/`](prototipo/). Abre com dois cliques, sem internet e sem instalar nada. Negócio, nomes, telefones e valores são dados de exemplo.

| Serviço | Profissional | Dia e horário | Seus dados | Horário marcado |
|---|---|---|---|---|
| ![](telas/cliente-1-servicos.png) | ![](telas/cliente-2-profissional.png) | ![](telas/cliente-3-horario.png) | ![](telas/cliente-4-dados.png) | ![](telas/cliente-5-confirmado.png) |

| Criar a agenda | Agenda do dia | Agenda no celular |
|---|---|---|
| ![](telas/painel-2-servicos.png) | ![](telas/painel-5-agenda.png) | ![](telas/painel-6-agenda-celular.png) |

**Como foi verificado:** [`ferramentas/verificar.mjs`](ferramentas/verificar.mjs) percorre os fluxos do cliente e do dono, roda o axe-core nas 24 telas e estados e mede os alvos de toque. Ele pegou um bug real: ao tocar em "Confirmar agendamento", a mensagem de erro do campo aparecia, empurrava o botão para baixo e o toque se perdia. O bug foi corrigido e ganhou um teste para não voltar.

<!-- TODO(Beatriz): reproduzir esse bug sozinha (passo a passo no item 13 do ESTUDO.md) antes de contar essa história numa entrevista. -->

**No Figma** ([Agenda Fácil · Case UX](https://www.figma.com/design/KzXCAfLG2xE3x8FT3fQGRR)): variáveis com os mesmos nomes do CSS, componentes com variantes, as 14 telas, os wireframes, a pesquisa, os fluxos e o caminho do cliente clicável na página "Protótipo". O plano gratuito aceita 3 páginas, então as cinco partes ficaram em "Pesquisa · Fluxos", "Wireframes · UI" e "Protótipo".

## Decisões de design

1. **O cliente não cria conta: nome e WhatsApp bastam.** Os quatro apps do benchmark pedem algum cadastro, e a hipótese H5 é que isso faz o cliente desistir. Para o dono confiar (H6), ele pode pedir confirmação pelo WhatsApp com um toque.
2. **Escolher já avança.** Sem botão "Próximo": 3 ou 4 toques e 2 campos até confirmar. Contra o toque sem querer, um resumo com "Alterar" em cada item.
3. **"Sem preferência" vem primeiro**, e o passo some quando há uma pessoa só (H8). Cada profissional mostra o próximo horário livre.
4. **Dia e horário na mesma tela, e só horários livres.** A faixa de dias diz "lotado" ou "fechado" e o primeiro dia com vaga já vem escolhido.
5. **Dois clientes nunca ficam com o mesmo horário.** Quem perde a disputa vê o aviso, mantém o que digitou e recebe os horários mais próximos. Na Parte 2, a regra fica no banco de dados.
6. **A confirmação é um cartão de horário**, como o cartãozinho de papel que o salão entrega no balcão, com "Salvar na agenda do celular" (.ics) e "Mandar o comprovante no WhatsApp".
7. **Remarcar e cancelar pelo link**, com a regra do negócio ("até 2 horas antes") à vista antes da ação.
8. **Os avisos saem do WhatsApp do próprio dono** (link `wa.me`): sem custo, sem API paga e com o nome do negócio.
9. **Painel no computador, agenda do dia também no celular.** Se a entrevista confirmar H7, a versão de celular sobe para Must.
10. **A agenda parece um caderno organizado:** uma coluna por profissional, linhas de 30 minutos, status com ícone e texto, nunca só cor.
11. **Criar a agenda leva 3 passos, já preenchidos** pelo tipo de negócio, em vez de uma tela com 31 campos.
12. **Identidade própria e legível:** azul-caneta, verde marca-texto, Gabarito e Atkinson Hyperlegible, com contraste AA calculado em cada par ([design-system.md](design-system.md), [acessibilidade.md](acessibilidade.md)).
13. **Protótipo em HTML, não só em Figma:** dá para testar no celular da pessoa, verificar acessibilidade com ferramenta e reaproveitar os tokens na Parte 2.

## Testes de usabilidade

Um [roteiro com 5 tarefas](testes-usabilidade.md), cada uma com critérios de sucesso (sem ajuda, tempo máximo, toques fora do caminho): marcar um horário com a Rafa hoje à tarde; trocar o serviço antes de confirmar; cancelar o horário marcado; pedir a confirmação de um cliente e cancelar outro; bloquear um horário.

**Resultados:** o teste ainda não foi feito.

<!-- TODO(Beatriz): rodar o teste com 5 pessoas e preencher os resultados. -->

## Próximos passos

- Entrevistar 3 donos e 3 clientes (H1 e H7 primeiro), preencher a planilha de síntese e atualizar as hipóteses.
- Testar o protótipo com 5 pessoas.
- Resolver os dois achados abertos da avaliação: o botão de confirmar abaixo da dobra e o estado sem internet.
- Parte 2: construir o produto com os [requisitos](requisitos.md) Must primeiro, começando pela regra do horário no banco de dados.

## O que aprendi

Esta parte entra depois das entrevistas e do teste.

<!-- TODO(Beatriz): escrever com as minhas palavras o que aprendi. -->
