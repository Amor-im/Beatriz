# Benchmark: agendamento online para pequenos negócios de serviço

> **Status: verificação parcial.** Todas as fontes são públicas e cada linha tem link. Mas, no ambiente em que este rascunho foi montado, as páginas não abriam direto (o acesso era bloqueado), então cada afirmação foi conferida no trecho que a busca devolveu, não na página inteira. Os trechos usados estão em [benchmark-evidencias.md](benchmark-evidencias.md).
> TODO(Beatriz): abrir cada link, confirmar se o texto continua igual e corrigir o que mudou antes de publicar o case. Dois itens estão marcados com "(conferir)" porque não reencontrei o trecho original na segunda checagem.

Data de acesso de todas as fontes: 8 de outubro de 2026. Boa parte da ajuda do Booksy e da Playtomic é de centrais de outros países (EUA, Reino Unido, Portugal); isso está sinalizado onde importa.

Apps escolhidos: **Trinks** (salão e estética), **Booksy** (barbearia e beleza, marketplace global), **AppBarber** (barbearia) e **Playtomic** (quadra de padel e tênis). Escolhi esses quatro por serem conhecidos no Brasil e por terem documentação pública suficiente; AgendaPro, Fresha, Avec, Simples Agenda e Gendo ficaram de fora por falta de material verificável (detalhes no fim).

---

## 1. Trinks

A Trinks é um sistema de gestão para negócios de beleza (salões, barbearias, clínicas de estética) que inclui agendamento online para o cliente final. Segundo a página institucional, a empresa foi adquirida pelo Grupo Stone ([Trinks, Quem somos](https://negocios.trinks.com/quem-somos/)).

| Aspecto | O que encontrei | Fonte |
|---|---|---|
| (1) Como o cliente agenda | Pelo app Trinks.com ou pelo site trinks.com, buscando o estabelecimento. Exige cadastro: no site, "Entrar" e depois "Quero me Cadastrar" (ou login com Facebook); no app, "SOU NOVO NO TRINKS". | [Ajuda Trinks: cadastro do cliente](https://ajuda.trinks.com/cliente-como-se-cadastrar-atrav%C3%A9s-do-site-ou-aplicativo) |
| (1) Link via WhatsApp | O dono pode colocar o link do seu site na Trinks, acrescido de "/framebusca", na mensagem de saudação do WhatsApp Business; o agendamento feito por esse link cai na agenda da Trinks. | [Ajuda Trinks: agendamento por WhatsApp](https://ajuda.trinks.com/agendamento-por-whatsapp-como-direcionar-o-seu-cliente-para-a-agenda-usando-o-whatsapp-business-central-de-ajuda-do-trinks) |
| (2) Etapas (app) | Login, aba Início, busca por nome do local, serviço ou região, escolha do estabelecimento, visualização de serviços, preços, horários livres e profissionais, e a reserva passa a aparecer em "Meus Compromissos". O estabelecimento define se a reserva é confirmada automaticamente ou depende de aprovação. | [Ajuda Trinks: agendamento pelo app](https://ajuda.trinks.com/cliente-agendamento-online-atrav%C3%A9s-do-aplicativo) |
| (3) Lembretes e confirmação | O app avisa o cliente algumas horas antes do horário. Há também a "Rotina de mensagens via WhatsApp": confirmação às 17h do dia anterior (horários até 15h) ou às 8h do próprio dia (horários a partir de 15h), lembrete 1 hora antes e pesquisa de avaliação. Só agendamentos com status "Confirmado" e clientes com WhatsApp cadastrado recebem. | [Ajuda Trinks: agendamento pelo app](https://ajuda.trinks.com/cliente-agendamento-online-atrav%C3%A9s-do-aplicativo); [FAQ Rotina de Mensagens](https://ajuda.trinks.com/faq-rotina-de-mensagens-central-de-ajuda-do-trinks) |
| (4) Cancelamento e reagendamento | No app, pelo ícone "+" em "Meus Compromissos" (opções "Quero reagendar" e "Não vou poder ir"). Se o cliente responder à mensagem de WhatsApp dizendo que não vai comparecer, o agendamento é cancelado automaticamente na agenda. Agendamento pago antecipadamente não pode ser cancelado nem remarcado pelo cliente: só o estabelecimento faz isso (conferir: na segunda checagem só encontrei a versão traduzida da página). | [Ajuda Trinks: agendamento pelo app](https://ajuda.trinks.com/cliente-agendamento-online-atrav%C3%A9s-do-aplicativo); [Rotina de mensagens via WhatsApp](https://ajuda.trinks.com/rotina-de-mensagens-via-whatsapp); [Ajuda Trinks: pagamento online pelo app](https://ajuda.trinks.com/cliente-pagamento-online-atrav%C3%A9s-do-aplicativo) |
| (5) Preço para o dono | Plano pago, com tabela por faixa de número de profissionais (para 3 ou mais profissionais, "sob consulta"). A "Rotina de mensagens via WhatsApp" aparece como "Item adicional". Pelos termos de uso, cliente e profissional não pagam; quem paga é o estabelecimento. | [Trinks: planos](https://negocios.trinks.com/planos/); [Trinks: termos de uso](https://negocios.trinks.com/termos-de-uso/) |
| (6) Público | Salões, clínicas de estética, barbearias, esmalterias e spas (descrição do app do cliente). | [App Store: Trinks.com](https://apps.apple.com/br/app/trinks-com/id628518776) |

**Faz bem**
- Usa o WhatsApp, onde o cliente já conversa com o salão, como porta de entrada: a saudação automática do WhatsApp Business entrega o link de agendamento. [Ajuda Trinks](https://ajuda.trinks.com/agendamento-por-whatsapp-como-direcionar-o-seu-cliente-para-a-agenda-usando-o-whatsapp-business-central-de-ajuda-do-trinks)
- Fecha o ciclo da confirmação: a resposta "não vou" do cliente no WhatsApp libera o horário na agenda sem trabalho manual do dono. [Ajuda Trinks: Rotina de mensagens](https://ajuda.trinks.com/rotina-de-mensagens-via-whatsapp)
- O cliente remarca ou cancela sozinho, num ponto único ("+" em "Meus Compromissos"). [Ajuda Trinks: agendamento pelo app](https://ajuda.trinks.com/cliente-agendamento-online-atrav%C3%A9s-do-aplicativo)

**Faz mal / fricção**
- O cliente precisa criar conta (no site ou no app) para agendar; não encontrei documentação de agendamento sem cadastro. [Ajuda Trinks: cadastro do cliente](https://ajuda.trinks.com/cliente-como-se-cadastrar-atrav%C3%A9s-do-site-ou-aplicativo)
- As mensagens de WhatsApp saem exclusivamente do número da Trinks, em nome e com a logo da Trinks, e o texto ainda não pode ser personalizado; o cliente recebe a mensagem de uma marca que não é a do salão. [FAQ Rotina de Mensagens](https://ajuda.trinks.com/faq-rotina-de-mensagens-central-de-ajuda-do-trinks)
- A confirmação por WhatsApp é cobrada à parte do plano ("Item adicional"). [Trinks: planos](https://negocios.trinks.com/planos/)
- Uma reclamação pública no Reclame Aqui, feita por uma empresa de Dourados (MS) que usa a Trinks, relata clientes voltando à tela de login depois de agendar e não recebendo o código de confirmação por e-mail ou SMS (caso individual; a última interação do reclamante é de fevereiro de 2025). [Reclame Aqui](https://www.reclameaqui.com.br/trinks/problemas-recorrentes-no-agendamento-online-e-cadastro_xW5wsoS83y5_F64E/)

---

## 2. Booksy

O Booksy é uma plataforma de agendamento para beleza com marketplace: a versão em português lista barbearias e salões no Brasil (por exemplo, em São Paulo) com agendamento online ([Booksy: Barbearias](https://booksy.com/pt-br/s/barbearias)). A maior parte da central de ajuda encontrada é a versão dos EUA, então detalhes podem variar no Brasil.

| Aspecto | O que encontrei | Fonte |
|---|---|---|
| (1) Como o cliente agenda | Pelo app Booksy for Customers, pelo marketplace em Booksy.com ou por integrações com redes sociais. A central afirma que o cliente não precisa ter o app baixado para agendar. | [Booksy Support: o cliente precisa do app?](https://support.booksy.com/hc/en-us/articles/16486697667346-Do-my-clients-need-to-have-Booksy-for-Customers-downloaded-on-their-mobile-device-to-book-with-me) |
| (1) Conta do cliente | A conta é criada pelo app ou em booksy.com ("Log In / Sign Up"), com escolha do país, e-mail e dados pessoais; um código de verificação por SMS conclui o cadastro. | [Booksy Help: criar conta](https://help.booksy.com/hc/en-us/articles/21595664947474-How-do-I-create-a-Booksy-account) |
| (2) Etapas | Selecionar o estabelecimento e os serviços, clicar em "agendar agora", ver a lista de horários e vagas abertas e escolher o que encaixa na agenda. | [Booksy: Barbearias](https://booksy.com/pt-br/s/barbearias) |
| (3) Lembretes | Lembrete por SMS 24 horas antes; se o cliente está logado no app e agendou por ele, recebe push no lugar do SMS. Sem custo para o negócio (central dos EUA). | [Booksy Support: lembretes](https://support.booksy.com/hc/en-us/articles/16463854228114-Does-Booksy-send-clients-reminders-of-their-upcoming-appointments) |
| (4) Cancelamento e reagendamento | O cliente pode cancelar a qualquer momento entrando na conta; o negócio pode limitar quando o cliente remarca. Com "No-show Protection", o negócio pode exigir sinal (depósito) no agendamento ou cartão cadastrado para cobrar taxa de cancelamento. Remarcar cancela o agendamento original, o prazo é definido pelo prestador e pode haver taxa. | [Booksy Support: cancelar ou remarcar](https://support.booksy.com/hc/en-us/articles/16463839045394-Can-my-clients-cancel-or-reschedule-an-appointment-at-any-time); [Booksy Support: depósito x taxa](https://support.booksy.com/hc/en-us/articles/16487431553810-What-is-the-difference-between-Deposits-and-Cancellation-Fees); [Booksy Help: remarcar](https://help.booksy.com/hc/en-us/articles/21616159780242-How-can-I-reschedule-an-appointment) |
| (5) Preço para o dono | Assinatura mensal com todos os recursos incluídos e teste grátis; o app é gratuito para o cliente. A página de preços global (em inglês) mostra US$ 29,99 por mês mais US$ 20 por membro adicional da equipe, com taxas de processamento de pagamento à parte. | [Booksy Support: é grátis para o negócio?](https://support.booksy.com/hc/en-us/articles/23486975849490-Is-Booksy-free-for-my-business); [Booksy Biz: preços](https://biz.booksy.com/pricing) |
| (6) Público | Barbearias e salões de beleza (categorias do marketplace em português). | [Booksy: Barbearias](https://booksy.com/pt-br/s/barbearias); [Booksy: Salões de Beleza](https://booksy.com/pt-br/s/saloes-de-beleza) |

**Faz bem**
- Agendamento pelo navegador com o link do negócio, sem exigir download do app. [Booksy: Customer App](https://biz.booksy.com/en-us/features/customer-app); [Booksy Support](https://support.booksy.com/hc/en-us/articles/16486697667346-Do-my-clients-need-to-have-Booksy-for-Customers-downloaded-on-their-mobile-device-to-book-with-me)
- Ensina o dono a usar a mensagem de ausência do WhatsApp Business com o link de agendamento, para que quem chama no WhatsApp receba o link na hora. [Booksy Support: reservas pelo WhatsApp](https://support.booksy.com/hc/en-us/articles/28874825868690-How-to-take-bookings-from-WhatsApp)
- Lembrete automático sem custo para o negócio, escolhendo o canal (push ou SMS) conforme o cliente usa ou não o app. [Booksy Support: lembretes](https://support.booksy.com/hc/en-us/articles/16463854228114-Does-Booksy-send-clients-reminders-of-their-upcoming-appointments)

**Faz mal / fricção**
- Criar conta exige verificação por código SMS; a central tem até um artigo próprio para quando o código não chega. [Booksy Help: criar conta](https://help.booksy.com/hc/en-us/articles/21595664947474-How-do-I-create-a-Booksy-account); [Booksy Help: código não recebido](https://help.booksy.com/hc/en-us/articles/21641263976594-I-ve-created-my-Booksy-account-but-I-haven-t-received-a-verification-code)
- Remarcar não é "mover" o horário: cancela o original, pode ter taxa, e o suporte do Booksy não remarca pelo cliente. [Booksy Help: remarcar](https://help.booksy.com/hc/en-us/articles/21616159780242-How-can-I-reschedule-an-appointment)
- No Reclame Aqui há reclamações de usuários que não conseguiam cancelar a própria conta; na reclamação "Cancelamento de conta", a empresa respondeu que ainda não tinha "o botão de cancelamento dentro do aplicativo" (resposta antiga, pode ter mudado). [Reclame Aqui: Cancelamento de conta](https://www.reclameaqui.com.br/booksy/cancelamento-de-conta_rgxWk91AJPVjKV6N/)

---

## 3. AppBarber

O AppBarber é um sistema de agendamento e gestão para barbearias, com site para o estabelecimento e um app separado para o cliente final, "AppBarber: Cliente" ([AppBarber: Funcionalidades](https://www.appbarber.com.br/funcionalidades/); [App Store: AppBarber Cliente](https://apps.apple.com/br/app/appbarber-cliente/id6450795073)).

| Aspecto | O que encontrei | Fonte |
|---|---|---|
| (1) Como o cliente agenda | Pelo app do cliente (download gratuito, iOS e Android) ou pelo site da barbearia gerado pelo sistema, onde clientes novos podem encontrar o negócio por buscadores e agendar; o agendamento também pode ser colocado numa página do Facebook. | [AppBarber: Funcionalidades](https://www.appbarber.com.br/funcionalidades/) |
| (1) Cadastro | Post do blog (2020): "Ao fazer o cadastro no estabelecimento, nosso aplicativo já aprova automaticamente o acesso à sua agenda", ou seja, há cadastro do cliente, mas o dono não precisa aprovar um a um. | [Blog AppBarber (2020)](https://blog.appbarber.com.br/2020/09/09/o-appbarber-trabalha-24h-com-voce/) |
| (3) Lembretes e confirmação | Ao agendar, o cliente recebe push no app e e-mail no horário configurado; o profissional pode configurar lembretes por notificação, e-mail e/ou SMS. Há página web de confirmação com botão para confirmar presença. | [AppBarber: Funcionalidades](https://www.appbarber.com.br/funcionalidades/); [AppBarber: Confirmação de Agendamento](https://sistema.appbarber.com.br/confirmation/) |
| (4) Cancelamento | A página de confirmação orienta: "Se não puder comparecer, cancele seu horário pelo aplicativo ou entre em contato com o estabelecimento." | [AppBarber: Confirmação de Agendamento](https://sistema.appbarber.com.br/confirmation/) |
| (5) Preço para o dono | Plano pago, com preços por faixa de profissionais (1, 2 a 5, 6 a 15, mais de 15) e ciclos mensal, semestral e anual; teste grátis de 30 dias (conferir: o trecho da página veio com os rótulos dos ciclos confusos). | [AppBarber](https://appbarber.com.br/); [AppBarber: Funcionalidades](https://www.appbarber.com.br/funcionalidades/) |
| (6) Público | Barbearias. | [AppBarber](https://appbarber.com.br/) |

**Faz bem**
- Confirmação de presença por um botão numa página web, sem precisar abrir o app. [AppBarber: Confirmação de Agendamento](https://sistema.appbarber.com.br/confirmation/)
- Lista de espera: quando um horário vaga, quem está na fila é avisado automaticamente. [AppBarber: Funcionalidades](https://www.appbarber.com.br/funcionalidades/)
- O dono não precisa aprovar cada cliente novo; o cadastro libera a agenda automaticamente. [Blog AppBarber (2020)](https://blog.appbarber.com.br/2020/09/09/o-appbarber-trabalha-24h-com-voce/)

**Faz mal / fricção**
- O cancelamento depende do app ou de contato direto com a barbearia. [AppBarber: Confirmação de Agendamento](https://sistema.appbarber.com.br/confirmation/)
- Em reclamação no Reclame Aqui, um cliente final que assinou um pacote pelo app não conseguiu cancelar a assinatura por ele e teve de ir à barbearia; a empresa respondeu que a opção existe, mas o estabelecimento a desativou. O controle fica com o negócio, e o cliente não entende por que não consegue. [Reclame Aqui: Cancelamento não disponível pelo app](https://www.reclameaqui.com.br/app-barber/cancelamento-nao-disponivel-pelo-app_ClY0eIMnJbE4Fq8S/)
- O cliente precisa fazer cadastro no estabelecimento para ter acesso à agenda. [Blog AppBarber (2020)](https://blog.appbarber.com.br/2020/09/09/o-appbarber-trabalha-24h-com-voce/)

---

## 4. Playtomic

A Playtomic se apresenta como app para jogadores e clubes de esportes de raquete (padel, tênis), com o software Playtomic Manager para a gestão do clube ([Playtomic](https://playtomic.com/); [Playtomic Manager](https://playtomic.com/playtomic-manager)). Há clube brasileiro na plataforma, como a Academia Santo Padel Nacional, na Barra Funda, em São Paulo ([Playtomic: Academia Santo Padel Nacional](https://playtomic.com/clubs/academia-santo-padel-nacional)). A central de ajuda em português usa português de Portugal (ex.: "Como registar-se e criar a sua conta") ([Playtomic: criar conta](https://playerhelp.playtomic.com/hc/pt/articles/19831938095633-Como-registar-se-e-criar-a-sua-conta-no-Playtomic)).

| Aspecto | O que encontrei | Fonte |
|---|---|---|
| (1) Como o jogador reserva | Pelo app Playtomic, buscando o clube. Cadastro com Apple, Google, Facebook ou e-mail e senha; número de celular obrigatório; e-mail de confirmação com link para ativar a conta. Pelo site, só Apple, Google ou Facebook. Conta obrigatória para entrar em partidas públicas. | [Playtomic: criar conta](https://playerhelp.playtomic.com/hc/pt/articles/19831938095633-Como-registar-se-e-criar-a-sua-conta-no-Playtomic) |
| (2) Etapas | Tela inicial, reservar campo, modalidade, busca do clube (nome, cidade ou código postal), data e hora, filtros opcionais, escolha do clube, horário e campo, escolha entre pagar a sua parte ou o valor total, revisão da política de cancelamento do clube, meio de pagamento e conclusão. | [Playtomic: criar uma reserva](https://playerhelp.playtomic.com/hc/pt/articles/19831881490449-Criar-uma-reserva-na-aplica%C3%A7%C3%A3o-Playtomic) |
| (3) Confirmação | Após a reserva online, o jogador recebe e-mail com nome, data e hora, local e dados de pagamento; o clube pode configurar uma mensagem própria por quadra. Alterações na reserva chegam por e-mail e notificação no app. | [Playtomic Manager: comunicação e notificações](https://helpmanager.playtomic.com/hc/en-gb/articles/20535292080145-Communication-and-notifications); [Playtomic Manager: regras para modificar reserva](https://helpmanager.playtomic.com/hc/pt/articles/20534894210833-Regras-gerais-para-modificar-uma-reserva) |
| (4) Cancelamento e reagendamento | Cancelamento pelo app (Perfil, detalhes da reserva, cancelar), só dentro da política de cada clube; fora dela, a Playtomic não cancela e o jogador precisa falar com o clube. A reserva não pode ser alterada pelo app: mudar data, horário ou quadra exige contato com o clube. | [Playtomic: cancelar reserva](https://playerhelp.playtomic.com/hc/pt/articles/19832121593873-Cancelar-uma-reserva); [Playtomic: modificar reserva](https://playerhelp.playtomic.com/hc/en-gb/articles/19832144958225-How-to-modify-a-reservation) |
| (5) Preço | Para o clube: Playtomic Manager com quatro planos (Standard, Professional, Champion, Master), cobrança mensal ou anual. Para o jogador: taxa de serviço em transações online, que varia por país e já vem incluída no preço exibido. | [Playtomic Manager: preços](https://playtomic.com/es/precios); [Playtomic: taxa de serviço](https://playerhelp.playtomic.com/hc/pt/articles/19831779272337-Jogos-abertos-Taxa-de-servi%C3%A7o); [Playtomic: Service Fee](https://playerhelp.playtomic.com/hc/en-gb/articles/19831779272337-Service-Fee) |
| (6) Público | Clubes e jogadores de padel e tênis. | [Playtomic](https://playtomic.com/) |

**Faz bem**
- Pagamento dividido na própria reserva: o jogador escolhe pagar só a sua parte ou o valor total. [Playtomic: criar uma reserva](https://playerhelp.playtomic.com/hc/pt/articles/19831881490449-Criar-uma-reserva-na-aplica%C3%A7%C3%A3o-Playtomic)
- Mostra a política de cancelamento do clube antes de confirmar e libera o botão de cancelar enquanto o prazo permite. [Playtomic: criar uma reserva](https://playerhelp.playtomic.com/hc/pt/articles/19831881490449-Criar-uma-reserva-na-aplica%C3%A7%C3%A3o-Playtomic); [Playtomic: cancelar reserva](https://playerhelp.playtomic.com/hc/pt/articles/19832121593873-Cancelar-uma-reserva)
- Preço final exibido já com a taxa de serviço, sem surpresa no pagamento. [Playtomic: taxa de serviço](https://playerhelp.playtomic.com/hc/pt/articles/19831779272337-Jogos-abertos-Taxa-de-servi%C3%A7o)

**Faz mal / fricção**
- Cadastro pesado antes de jogar: celular obrigatório e ativação por link no e-mail; pelo site, só login social. [Playtomic: criar conta](https://playerhelp.playtomic.com/hc/pt/articles/19831938095633-Como-registar-se-e-criar-a-sua-conta-no-Playtomic)
- Não há "trocar horário" no app: qualquer mudança passa pelo clube. [Playtomic: modificar reserva](https://playerhelp.playtomic.com/hc/en-gb/articles/19832144958225-How-to-modify-a-reservation)
- O jogador paga uma taxa de serviço da plataforma por cima do preço da quadra. [Playtomic: taxa de serviço](https://playerhelp.playtomic.com/hc/pt/articles/19831779272337-Jogos-abertos-Taxa-de-servi%C3%A7o)

---

## Dados públicos sobre pequenos negócios e WhatsApp (Sebrae)

- Em reportagem sobre a 12ª edição da Pesquisa Pulso dos Pequenos Negócios, a Agência Sebrae informa que o índice do WhatsApp "agora alcança 82% dos microempreendedores individuais (MEI) e das micro e pequenas empresas" e que "Oito em cada dez donos de pequenos negócios apontam que o WhatsApp é o seu principal canal de comunicação e de vendas"; a base é de mais de 8,2 mil empreendedores ouvidos em fevereiro e março de 2026. Fonte: reportagem, não o relatório completo. [Agência Sebrae](https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/)
- Na pesquisa "Transformação Digital nos Pequenos Negócios" (6ª edição, novembro de 2023; quantitativa por telefone, 6.247 entrevistados MEI, ME e EPP), o WhatsApp é o canal digital mais usado para vender (56%), à frente do Instagram (43%), entre os pequenos negócios que usam internet. [Sebrae, resumo em PDF](https://agenciasebrae.com.br/wp-content/uploads/2023/12/Pesquisa_TIC_2023-RESUMO_segmentos_economicos-1.pdf)

---

## O que fica para o Agenda Fácil

*Esta seção é interpretação minha a partir do benchmark, por isso não tem fonte. Cada item virou uma decisão de design ou uma hipótese em [hipoteses.md](hipoteses.md).*

1. **Conta é a maior barreira comum.** Trinks, Booksy e Playtomic pedem cadastro com verificação (código por SMS ou link no e-mail) antes do primeiro agendamento. Agendar só com nome e celular, sem senha, é o diferencial mais claro do Agenda Fácil, e deve ser testado como hipótese principal.
2. **O WhatsApp é a porta de entrada, não um canal extra.** Trinks e Booksy ensinam o dono a colar o link na saudação do WhatsApp Business, e o Sebrae mostra o WhatsApp como canal dominante dos pequenos negócios. O fluxo deve começar num link aberto a partir de uma conversa no WhatsApp e funcionar bem no navegador interno dele.
3. **A confirmação deve falar com a voz do negócio.** Na Trinks, a mensagem chega com nome e logo da plataforma. Para um salão de bairro, a confiança vem do nome do salão; a plataforma deve aparecer o mínimo possível.
4. **Remarcar deve ser uma ação de um toque.** Nos quatro apps, remarcar é cancelar e refazer, ou depende de falar com o estabelecimento. Um "trocar horário" direto, respeitando as regras do dono, resolve uma dor que ninguém resolveu bem.
5. **Regras do dono precisam ficar visíveis para o cliente.** Playtomic mostra a política de cancelamento antes de confirmar; o caso do AppBarber mostra a frustração quando o dono desativa uma opção e o cliente não sabe por quê. O Agenda Fácil deve exibir as regras (prazo de cancelamento, sinal) no momento da escolha e explicar quando uma ação não está disponível.
6. **Preço para o dono deve ser simples.** Os concorrentes cobram por número de profissionais e vendem o WhatsApp como adicional. Um plano único e previsível para o pequeno negócio é um argumento de valor a validar com donos.

---

## Afirmações descartadas

O que tentei verificar e não entrou (ou entrou sem o detalhe):

- **Acesso direto às páginas:** WebFetch bloqueado (EGRESS_BLOCKED) em trinks.com, ajuda.trinks.com, negocios.trinks.com, booksy.com, biz.booksy.com, support.booksy.com, playtomic.com, appbarber.com.br, agendapro.com, fresha.com, simplesagenda.com.br, avec.app, play.google.com, apps.apple.com, reclameaqui.com.br, getapp.com, sebrae.com.br e en.wikipedia.org. Nenhuma página foi lida na íntegra.
- **Valores exatos da Trinks:** a página de planos indexada mostrava valores para 1 a 2 profissionais, mas o trecho não deixava claro o nome do plano nem a periodicidade, então não citei nenhum valor.
- **Valores exatos do AppBarber:** a página indexada mostrava valores por faixa, mas com rótulos de ciclo (mensal, semestral, anual) embaralhados; não dá para afirmar qual valor é de qual ciclo.
- **Preço do Booksy em reais:** não encontrei página pública com preço para o Brasil; só a página global em dólar.
- **Booksy sem conta pelo link:** a ajuda diz que não é preciso baixar o app, mas não diz se é possível agendar pelo navegador sem criar conta.
- **Booksy e link que força download:** um trecho indicava que certo tipo de link leva quem não tem o app a baixá-lo, mas não consegui ligar o trecho a uma URL específica.
- **Etapas do agendamento no AppBarber:** não encontrei passo a passo oficial do fluxo do cliente.
- **Lembrete automático antes do jogo na Playtomic:** não encontrei documentação de lembrete nativo enviado ao jogador.
- **Valores e moeda dos planos da Playtomic:** a página em espanhol mostrava números sem moeda clara e com dois conjuntos de valores; não usei.
- **Prazo de reembolso da Playtomic:** a página em português fala em 2 a 10 dias úteis e a versão em inglês em até 15 dias úteis; contradição, retirei do texto.
- **Removidas no fact-check:** "profissionais" como autores das reclamações de cancelamento de conta do Booksy (uma das respostas trata de perfil de cliente, então troquei por "usuários"); "documentação pública escassa" do AppBarber (era afirmação de ausência, sem fonte que a sustente).
- **Reembolso da taxa de serviço da Playtomic:** artigos da própria central se contradizem (um diz que não é devolvida, outro diz que é).
- **Período de teste da Playtomic:** artigos citam "dois meses" e "duas semanas"; contradição, não usei.
- **Notas, número de avaliações e downloads nas lojas de apps:** as lojas estavam bloqueadas; os números só apareceram em trechos de busca com datas divergentes, então não citei.
- **Avaliações de usuários na Google Play e App Store:** não li nenhuma avaliação diretamente; não citei.
- **Indicadores do Reclame Aqui (nota, % resolvidas, contagem por categoria):** os trechos mostravam versões diferentes da página com números que não batem; citei apenas reclamações específicas.
- **Trinks: número de estabelecimentos atendidos:** páginas da própria empresa citam números diferentes; não usei.
- **Trinks: lembrete por SMS ("Lembrete Premium"):** apareceu num resumo de busca, mas não confirmei no artigo específico.
- **AgendaPro, Fresha, Avec, Simples Agenda e Gendo:** não entraram. A AgendaPro tem material sobre agendamento por link e lembretes por WhatsApp, mas as páginas com caminho /br/ estavam em espanhol e não achei detalhes específicos do Brasil; as demais não foram pesquisadas a fundo porque os domínios estavam bloqueados.
