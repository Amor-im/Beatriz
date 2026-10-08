# Fluxos

Três fluxos cobrem o MVP: o cliente agenda, o dono configura, o dono gerencia o dia. Os diagramas são Mermaid: o GitHub desenha sozinho; no VS Code, use uma extensão de pré-visualização de Mermaid.

Legenda usada nos três:
- retângulo: tela ou passo
- losango: decisão (do sistema ou da pessoa)
- retângulo arredondado: início ou fim
- linha tracejada: caminho alternativo ou de erro

---

## 1. Cliente agenda um horário

Do link até a confirmação. A meta foi o **menor número de toques sem esconder informação**: escolher um serviço, um profissional ou um horário já leva para o passo seguinte (não existe botão "Continuar" nesses passos), e o único formulário é o de nome e WhatsApp.

```mermaid
flowchart TD
    A([Cliente abre o link<br/>no Instagram, WhatsApp ou QR code]) --> B[Página do negócio<br/>+ lista de serviços<br/><b>passo 1: Serviço</b>]
    B -->|toca num serviço| C{O negócio tem mais<br/>de 1 profissional?}
    C -->|sim| D[Profissional<br/><b>passo 2</b><br/>primeira opção: Sem preferência]
    C -->|não| E
    D -->|toca numa opção| E[Dia e horário<br/><b>passo 3</b><br/>só horários livres]
    E --> F{O dia escolhido<br/>tem horário livre?}
    F -->|não| G[Estado vazio:<br/>botão para o próximo dia com horário]
    G --> E
    F -->|sim, toca num horário| H[Seus dados<br/><b>passo 4</b><br/>resumo + nome + WhatsApp]
    H -->|Confirmar agendamento| I{Dados válidos?}
    I -.->|não| J[Erro no campo<br/>dizendo como corrigir<br/>foco no primeiro erro]
    J -.-> H
    I -->|sim| K{O horário ainda<br/>está livre?}
    K -.->|não: outra pessoa reservou antes| L[Aviso + horários<br/>mais próximos]
    L -.-> H
    K -->|sim| M([Horário marcado<br/>cartão com dia, hora, serviço e endereço])
    M --> N[Opcional: salvar na agenda do celular<br/>ou mandar o comprovante no WhatsApp]
    M --> O[Página Meu horário<br/>para remarcar ou cancelar]
    H -.->|Alterar, no resumo| E
```

**Quantos toques:** serviço (1) + profissional (1, ou 0 se o negócio tem uma pessoa só) + horário (1) + nome e WhatsApp + confirmar (1) = **3 a 4 toques e 2 campos**. A troca de dia não conta porque o primeiro dia com horário livre já vem selecionado.

---

## 2. Dono configura a agenda

Do cadastro até ter um link para divulgar. Cada passo já vem preenchido com uma sugestão que o dono pode aceitar como está.

```mermaid
flowchart TD
    A([Dono chega pelo site]) --> B[Criar sua agenda<br/>nome do negócio, tipo, e-mail, senha]
    B --> C{Tipo de negócio}
    C -->|salão, barbearia, estética| D1[Sugestões de serviços<br/>do tipo escolhido]
    C -->|quadra| D2[Sugestões de quadra por hora<br/>o passo 'profissional' vira 'quadra']
    C -->|outro| D3[Lista vazia]
    D1 & D2 & D3 --> E[Serviços<br/>nome, duração e preço<br/>editar, remover, adicionar]
    E --> F{Pelo menos<br/>1 serviço?}
    F -.->|não| E
    F -->|sim| G[Horários e equipe<br/>dias abertos, abertura, fechamento, intervalo<br/>quem atende]
    G --> H([Seu link está pronto])
    H --> I[Copiar link]
    H --> J[Compartilhar no WhatsApp]
    H --> K[Baixar QR code<br/>para o balcão]
    H --> L[Ver como o cliente vê]
    H --> M[Ir para a agenda]
```

---

## 3. Dono gerencia o dia

A tela "Agenda do dia" é a casa do dono. Avisar o cliente acontece pelo WhatsApp do próprio dono, com a mensagem já escrita (link `wa.me`), sem custo de API no MVP.

```mermaid
flowchart TD
    A([Dono abre o painel]) --> B[Agenda de hoje<br/>uma coluna por profissional]
    B --> C{Tem horário<br/>marcado no dia?}
    C -->|não| D[Estado vazio:<br/>copiar link para divulgar]
    C -->|sim| E[Toca num agendamento<br/>painel de detalhes abre ao lado]

    E --> F[Pedir confirmação<br/>abre o WhatsApp com mensagem pronta]
    F --> G[Marcar como confirmado]

    E --> H[Cancelar agendamento]
    H --> I[Janela: motivo opcional<br/>+ 'avisar o cliente no WhatsApp']
    I -->|Cancelar agendamento| J([Horário volta a ficar livre<br/>aviso com 'Desfazer'])
    I -.->|Voltar| E

    B --> K[Bloquear horário]
    K --> L[Janela: profissional, dia,<br/>início, fim, motivo]
    L --> M{Já tem agendamento<br/>nesse intervalo?}
    M -.->|sim| N[Aviso: quais horários<br/>serão afetados]
    N -.-> L
    M -->|não| O([Intervalo aparece hachurado<br/>e some do link público])

    B --> P[Novo agendamento<br/>cliente que ligou ou chegou no balcão]
    P --> Q([Entra na agenda como qualquer outro])
```
