// =========================================================
// Agenda Fácil · primeiro acesso do dono (3 passos)
// =========================================================

// Mostra ou esconde o erro de um campo. A mensagem tem o id "<id do campo>-erro".
function mostrarErro(campo, temErro) {
  campo.setAttribute('aria-invalid', temErro ? 'true' : 'false');
  document.getElementById(`${campo.id}-erro`)?.classList.toggle('esta-visivel', temErro);
}

// ---------- Passo 1: criar conta ----------
const formCadastro = document.querySelector('#form-cadastro');
if (formCadastro) {
  formCadastro.noValidate = true;
  const { negocio, email, senha } = formCadastro.elements;
  const regras = [
    [negocio, () => negocio.value.trim().length >= 2],
    [email, () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())],
    [senha, () => senha.value.length >= 8],
  ];

  // Tocando em "Continuar", deixo o envio mostrar os erros (o botão não pula de lugar no meio do toque)
  let indoEnviar = false;
  formCadastro.querySelector('button[type="submit"]').addEventListener('pointerdown', () => { indoEnviar = true; });
  document.addEventListener('pointerup', () => { setTimeout(() => { indoEnviar = false; }, 0); });

  // Valida ao sair do campo; depois que deu erro, revalida a cada tecla para o erro sumir logo
  for (const [campo, valido] of regras) {
    campo.addEventListener('blur', () => { if (campo.value && !indoEnviar) mostrarErro(campo, !valido()); });
    campo.addEventListener('input', () => { if (campo.getAttribute('aria-invalid') === 'true') mostrarErro(campo, !valido()); });
  }

  formCadastro.addEventListener('submit', (evento) => {
    const errados = regras.filter(([campo, valido]) => { mostrarErro(campo, !valido()); return !valido(); });
    if (errados.length) {
      evento.preventDefault();
      errados[0][0].focus();
    }
  });

  // Mostrar senha: o botão troca o tipo do campo e diz o estado (aria-pressed)
  document.querySelector('#mostrar-senha').addEventListener('click', (evento) => {
    const botao = evento.currentTarget;
    const mostrando = senha.type === 'text';
    senha.type = mostrando ? 'password' : 'text';
    botao.setAttribute('aria-pressed', String(!mostrando));
    botao.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Esconder senha');
  });
}

// ---------- Passo 2: serviços ----------
const listaServicos = document.querySelector('#lista-servicos');
if (listaServicos) {
  const modelo = listaServicos.querySelector('.linha-servico');

  function novaLinha(nome = '') {
    const linha = modelo.cloneNode(true);
    const numero = listaServicos.querySelectorAll('.linha-servico').length + 1;
    const [campoNome, duracao, preco] = linha.querySelectorAll('.campo__entrada');
    campoNome.value = nome;
    campoNome.setAttribute('aria-label', `Nome do serviço ${numero}`);
    duracao.setAttribute('aria-label', `Duração do serviço ${numero}`);
    duracao.selectedIndex = 1;
    preco.value = '';
    preco.setAttribute('aria-label', `Preço do serviço ${numero}, em reais`);
    linha.querySelector('[data-remover]').setAttribute('aria-label', `Remover ${nome || `serviço ${numero}`}`);
    listaServicos.append(linha);
    return campoNome;
  }

  document.querySelector('#adicionar-servico').addEventListener('click', () => novaLinha().focus());

  // Sugestão vira serviço e o chip some (não dá para adicionar duas vezes)
  document.querySelectorAll('[data-sugestao]').forEach((chip) => {
    chip.addEventListener('click', () => {
      novaLinha(chip.dataset.sugestao);
      mostrarToast(`${chip.dataset.sugestao} adicionado. Confira a duração e o preço.`);
      chip.remove();
    });
  });

  listaServicos.addEventListener('click', (evento) => {
    const remover = evento.target.closest('[data-remover]');
    if (!remover) return;
    const linha = remover.closest('.linha-servico');
    const nome = linha.querySelector('input').value || 'Serviço';
    linha.remove();
    mostrarToast(`${nome} removido`, {
      acao: { texto: 'Desfazer', aoClicar: () => listaServicos.append(linha) },
    });
  });

  document.querySelector('#form-servicos').addEventListener('submit', (evento) => {
    const temServico = [...listaServicos.querySelectorAll('.linha-servico input[type="text"]:not([inputmode])')].some((c) => c.value.trim());
    document.querySelector('#servicos-erro').classList.toggle('esta-visivel', !temServico);
    if (!temServico) evento.preventDefault();
  });
}

// ---------- Passo 3: horários e equipe ----------
document.querySelectorAll('[data-dia]').forEach((interruptor) => {
  interruptor.addEventListener('change', () => {
    const linha = interruptor.closest('.linha-dia');
    linha.querySelectorAll('input[type="time"]').forEach((hora) => { hora.disabled = !interruptor.checked; });
    linha.querySelector('[data-estado]').textContent = interruptor.checked ? 'Aberto' : 'Fechado';
  });
});

const listaEquipe = document.querySelector('#lista-equipe');
if (listaEquipe) {
  document.querySelector('#adicionar-pessoa').addEventListener('click', () => {
    const numero = listaEquipe.children.length + 1;
    const pessoa = document.createElement('div');
    pessoa.className = 'pessoa';
    pessoa.innerHTML = `<span class="avatar avatar--neutro" aria-hidden="true">?</span>
      <input class="campo__entrada" type="text" aria-label="Nome da pessoa ${numero}">
      <button type="button" class="botao-icone" data-remover aria-label="Remover pessoa ${numero}"><span class="icone icone-x" aria-hidden="true"></span></button>`;
    listaEquipe.append(pessoa);
    pessoa.querySelector('input').focus();
  });
  listaEquipe.addEventListener('click', (evento) => {
    evento.target.closest('[data-remover]')?.closest('.pessoa').remove();
  });
}
