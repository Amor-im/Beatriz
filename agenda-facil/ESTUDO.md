# Como o código funciona

Um guia, parte por parte, de como o Agenda Fácil funciona por dentro e por que cada escolha foi feita. Cada seção traz o conceito e onde ele aparece no código. O melhor jeito de usar: ler a seção, abrir os arquivos indicados e rodar o teste que cobre aquela parte.

---

## 1. As camadas do Spring: controller → service → repository

Cada funcionalidade da API mora num pacote (`servico`, `agendamento`, `auth`...) e é dividida em três camadas:

- **Controller** recebe a requisição HTTP, valida o formato do corpo (`@Valid`) e chama o service. Não tem regra de negócio. Exemplo: `ServicoController` só traduz `POST /api/servicos` em `servico.criar(...)`.
- **Service** tem as regras: "duração em múltiplos de 5", "serviço com agendamento não pode ser excluído", "o dono só mexe no que é dele". Também é onde ficam as transações (`@Transactional`).
- **Repository** conversa com o banco. É uma interface que estende `JpaRepository`: o Spring Data cria a implementação sozinho a partir do nome do método (`findByIdAndNegocioId`) ou de uma consulta escrita à mão (`@Query`).

Entre as camadas e o mundo de fora circulam **DTOs em `record`** (`ServicoRequest`, `ServicoResponse`), nunca a entidade. Assim, um campo novo na tabela não vaza na API sem querer, e o JSON de entrada não consegue mudar campos que não deveria (como o dono de um serviço).

Os erros também têm um lugar só: as exceções do pacote `erro` viram respostas padronizadas no `ApiExceptionHandler` (`@RestControllerAdvice`). `ConflitoException` vira 409, `RegraDeNegocioException` vira 422 e assim por diante.

**Onde olhar:** `api/src/main/java/com/agendafacil/servico/` (o pacote mais simples), `erro/ApiExceptionHandler.java`.


---

## 2. JPA e relacionamentos

As entidades (`@Entity`) são classes Java que representam tabelas. Os relacionamentos do projeto:

- `Dono` 1 ↔ 1 `Negocio` (`@OneToOne`): cada pessoa tem um negócio.
- `Negocio` 1 → N `Servico`, `HorarioFuncionamento`, `Bloqueio`, `Agendamento` (`@ManyToOne` do lado do filho).
- `Servico` 1 → N `Agendamento`.

Pontos para entender:

- **`fetch = FetchType.LAZY`**: o negócio de um serviço só é carregado do banco se alguém pedir. Isso evita consultas desnecessárias, mas exige estar dentro de uma transação quando o dado é acessado.
- **`join fetch`** em `AgendamentoRepository.daAgenda`: busca os agendamentos já com o serviço numa consulta só. Sem isso, a agenda faria uma consulta extra para cada linha (o problema "N+1").
- **`open-in-view: false`** no `application.yml`: a conexão com o banco não fica aberta durante a montagem do JSON. Força a buscar tudo o que precisa dentro do service.
- **`ddl-auto: validate`**: o Hibernate só confere se as entidades batem com as tabelas. Quem cria e altera tabela é o Flyway.

**Onde olhar:** `agendamento/Agendamento.java`, `agendamento/AgendamentoRepository.java`, `negocio/Negocio.java`.


---

## 3. Flyway: o banco versionado

Toda mudança no banco é um arquivo SQL numerado em `api/src/main/resources/db/migration/`. Na subida da API, o Flyway olha a tabela `flyway_schema_history`, vê quais arquivos ainda não rodaram e roda na ordem. Um arquivo que já rodou nunca é editado: uma mudança nova vira `V2__...sql`.

O `V1__esquema_inicial.sql` tem as regras que o banco garante sozinho, mesmo que a API tenha um bug:

- `CHECK` (duração entre 5 e 480 minutos, slug só com letras minúsculas e hífen, almoço dentro do expediente);
- `UNIQUE` (e-mail sem diferenciar maiúscula, slug, um registro por dia da semana);
- a regra principal, `agendamento_sem_sobreposicao`: um `EXCLUDE USING gist` que não deixa dois agendamentos do mesmo negócio terem faixas de horário que se sobrepõem (`tstzrange(inicio, fim) &&`). Os cancelados não contam. A extensão `btree_gist` permite misturar "mesmo negócio" (`=`) com "sobrepõe" (`&&`) na mesma regra.

**Onde olhar:** `V1__esquema_inicial.sql`, teste `oProprioBancoRecusaHorariosQueSeSobrepoem` em `AgendamentoIntegracaoTest`.


---

## 4. Login: BCrypt e JWT

**BCrypt.** A senha nunca é guardada. O `BCryptPasswordEncoder` gera um "resumo" com sal aleatório (`senha_hash`). No login, o `matches` refaz a conta e compara. Quem tiver acesso ao banco não descobre a senha.

**JWT.** Depois do login, o `TokenService` monta um token com o id do dono (`sub`), o e-mail e a validade (8 horas), assinado com o `JWT_SEGREDO` (HS256). O token não é criptografado, só assinado: qualquer um consegue ler, mas ninguém consegue alterar sem a assinatura quebrar. Por isso ele não leva nada sensível.

**Cookie HttpOnly.** O token vai num cookie `af_sessao` com `HttpOnly` (o JavaScript da página não lê), `SameSite=Lax` (outro site não consegue disparar requisições com ele) e `Secure` em produção. Em cada rota do painel, o Spring Security (`oauth2ResourceServer().jwt()`) lê o cookie, confere a assinatura e a validade e entrega o token para o controller (`@AuthenticationPrincipal Jwt`).

Proteções do login e do cadastro (`AuthService`):

- no login, a mesma mensagem para e-mail inexistente e para senha errada;
- o BCrypt roda mesmo quando o e-mail não existe, para o tempo de resposta do login não entregar quais e-mails têm conta;
- no login, limite de 10 tentativas por minuto por IP e de 5 senhas erradas para o mesmo e-mail, a partir do mesmo IP, em 15 minutos. A chave junta e-mail e IP porque, só com o e-mail, qualquer pessoa conseguiria trancar o dono fora da própria conta;
- o cadastro avisa quando o e-mail já tem conta (ajuda quem esqueceu que se cadastrou). Para isso não virar um jeito de testar e-mails em massa, toda tentativa de cadastro conta no limite de 10 por hora por IP, inclusive as recusadas;
- a API não sobe se o `JWT_SEGREDO` for curto ou ainda for o texto de exemplo do `.env.example`.

**Onde olhar:** `config/SegurancaConfig.java`, `auth/AuthService.java`, `auth/TokenService.java`, `auth/CookieDeSessao.java`, `AuthIntegracaoTest`.


---

## 5. Por que a disponibilidade fica no back-end

A página pública nunca decide se um horário está livre. Ela pede a lista para a API (`GET /horarios?servicoId&data`) e só mostra. Na hora de marcar, a API confere tudo de novo antes de gravar.

Se a regra ficasse no front, bastaria abrir o DevTools e mandar um `POST` com qualquer horário: em cima de outro cliente, às 3 da manhã ou ontem. O front é código que roda no computador do usuário e pode ser alterado; o servidor não.

O cálculo fica na `CalculadoraDeHorarios`, uma classe sem Spring e sem banco: recebe expediente, duração, horários ocupados e "agora", e devolve a lista. O `DisponibilidadeService` busca os dados no banco e chama a calculadora. Essa separação deixa a regra mais importante do produto fácil de testar.

O `AgendamentoService.agendar` não tem `@Transactional` de propósito: a gravação usa a transação do próprio repositório (`saveAndFlush`), e se o banco recusar por sobreposição, a exceção chega ao service, que responde 409 com os horários livres mais próximos.

O banco só garante agendamento contra agendamento. Agendamento contra bloqueio é conferido no service, mas sem trava: se o dono bloquear e um cliente marcar no mesmo instante, os dois podem entrar. A correção seria um `SELECT ... FOR UPDATE` na linha do negócio (uma trava pessimista). Essa limitação está descrita no README, em "Limitações conhecidas".

**Onde olhar:** `agendamento/CalculadoraDeHorarios.java`, `agendamento/DisponibilidadeService.java`, `agendamento/AgendamentoService.java`, teste `duasPessoasConfirmandoAoMesmoTempoSoUmaConsegue`.


---

## 6. Next.js com App Router

As rotas são pastas dentro de `web/src/app/`: `app/painel/servicos/page.tsx` vira `/painel/servicos` e `app/[slug]/page.tsx` atende qualquer link de negócio.

- **Server Components** (o padrão) rodam no servidor. A página pública busca o negócio na API ainda no servidor, então o nome e os serviços já chegam no HTML: mais rápido no celular e legível por buscadores.
- **Client Components** (`"use client"` no topo) rodam no navegador e podem ter estado e eventos. Exemplo: `FluxoDeAgendamento`, que reage às escolhas do cliente.
- **`<Suspense>`** mostra um esqueleto enquanto os dados não chegam. Com o Cache Components (ligado por padrão no Next 16), toda leitura de dado da requisição precisa estar dentro de um `Suspense`.
- **As escolhas ficam no endereço** (`?servico=1&data=2026-10-20&horario=10:20`): o botão Voltar do celular funciona, e o estado sobrevive a recarregar a página.
- **`proxy.ts`** (antigo "middleware") manda para `/entrar` quem abre o painel sem o cookie de sessão. É só um atalho de experiência: quem protege os dados é a API.
- **`lib/api.ts`** é o cliente tipado da API: um lugar só para montar URLs, mandar o cookie (`credentials: "include"`) e transformar erro em `ErroDaApi` com a mensagem pronta para a tela.

**Onde olhar:** `app/[slug]/page.tsx`, `componentes/publico/FluxoDeAgendamento.tsx`, `proxy.ts`, `lib/api.ts`.


---

## 7. Formulários com React Hook Form + Zod

- **Zod** descreve as regras de cada formulário num esquema (`lib/esquemas.ts`): nome com pelo menos 2 letras, WhatsApp com 10 ou 11 dígitos, senha com pelo menos 12 caracteres. O mesmo esquema gera o tipo TypeScript (`z.infer`).
- **React Hook Form** cuida do estado dos campos, mostra o erro quando a pessoa sai do campo (`mode: "onBlur"`) e no envio, e leva o foco para o primeiro campo com problema.
- O componente `Campo` liga rótulo, dica e erro ao campo com `id` e `aria-describedby`, para o leitor de tela ler tudo junto.
- **Erros do servidor** também aparecem no campo certo: quando a API responde 400 com `erros: { clienteWhatsapp: "..." }`, o formulário chama `setError` naquele campo.

A validação existe nos dois lados: o front valida para responder rápido, e o back valida porque é o único que não pode ser burlado (Bean Validation nos `record` de request, como `@NotBlank` e `@Pattern`).

**Onde olhar:** `lib/esquemas.ts`, `componentes/publico/FormularioAgendamento.tsx`, `componentes/Campo.tsx`, `agendamento/NovoAgendamentoRequest.java`.


---

## 8. Testes: Mockito, MockMvc, Testcontainers, Vitest e Playwright

| Tipo | Ferramenta | O que prova | Exemplo |
|---|---|---|---|
| Unidade (API) | JUnit 5 + Mockito | uma classe sozinha, com as dependências trocadas por "dublês" (mocks) | `AgendamentoServiceTest`: o banco recusa por sobreposição → vira 409 |
| Unidade pura | JUnit 5 | regra sem dependência nenhuma | `CalculadoraDeHorariosTest` |
| Integração (API) | MockMvc + Testcontainers | a API inteira, com um PostgreSQL 16 de verdade num container | `PainelIntegracaoTest`: outro dono recebe 404 |
| Componente (web) | Vitest + Testing Library | um componente React num navegador simulado | `FormularioAgendamento.test.tsx` |
| Ponta a ponta | Playwright | o navegador de verdade clicando nas telas, com a API rodando | `e2e/cliente.spec.ts` (390 px), `e2e/dono.spec.ts` (1440 px) |
| Acessibilidade | axe-core no Playwright | regras WCAG 2.1 A e AA em cada tela | `e2e/cliente-acessibilidade.spec.ts` |

Detalhes importantes:

- **`Clock` injetado.** As classes recebem um `Clock` em vez de chamar `Instant.now()`. Nos testes, o relógio fica parado numa segunda-feira às 08:00, e os testes não dependem do dia em que rodam.
- **Mock vs. container.** O Mockito testa a regra rápido e sem banco. O Testcontainers testa o que o mock não consegue: o SQL, o Flyway e a regra `EXCLUDE` do PostgreSQL.
- **Testing Library busca como o usuário enxerga** (`getByRole("button", { name: "Confirmar agendamento" })`), não por classe CSS. Se o botão perder o nome acessível, o teste quebra.

**Onde olhar:** `api/src/test/`, `web/src/**/*.test.tsx`, `web/e2e/`.


---

## Glossário rápido

- **DTO:** objeto só para transportar dados entre a API e quem a chama.
- **ProblemDetail:** formato padrão de erro em JSON (`title`, `status`, `detail`).
- **CORS:** regra do navegador que só deixa um site chamar a API de outro endereço se a API autorizar.
- **Slug:** a parte do link que identifica o negócio (`studio-exemplo`).
- **`timestamptz`:** data e hora com fuso. O banco guarda em UTC e a API converte para o fuso do negócio.
