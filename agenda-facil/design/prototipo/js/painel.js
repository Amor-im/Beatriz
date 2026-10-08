// =========================================================
// Agenda Fácil · painel do dono (agenda do dia)
// Cada agendamento é um <button class="bloco"> com os dados em data-*.
// Clicar seleciona e mostra os detalhes; as ações mudam o bloco na hora.
// =========================================================

const detalhes = document.querySelector('#detalhes');
let selecionado = document.querySelector('.bloco[aria-pressed="true"]');

// "15:40" → 940 (minutos desde a meia-noite)
const minutos = (hora) => { const [h, m] = hora.split(':').map(Number); return h * 60 + m; };
// Linha da grade: cada linha vale 10 minutos, a primeira é 9:00
const linhaDaGrade = (hora) => (minutos(hora) - 9 * 60) / 10 + 1;

const STATUS = {
  confirmado: '<span class="status status--confirmado"><span class="icone icone-check" aria-hidden="true"></span>Confirmado</span>',
  'a-confirmar': '<span class="status status--a-confirmar"><span class="icone icone-relogio" aria-hidden="true"></span>A confirmar</span>',
};

// ---------- Selecionar um agendamento ----------
function selecionar(bloco) {
  selecionado?.setAttribute('aria-pressed', 'false');
  selecionado?.classList.remove('bloco--selecionado');
  selecionado = bloco;
  if (!detalhes) return;
  if (!bloco) {
    detalhes.querySelector('[data-com-selecao]').hidden = true;
    detalhes.querySelector('[data-sem-selecao]').hidden = false;
    return;
  }
  bloco.setAttribute('aria-pressed', 'true');
  bloco.classList.add('bloco--selecionado');
  detalhes.querySelector('[data-com-selecao]').hidden = false;
  detalhes.querySelector('[data-sem-selecao]').hidden = true;
  preencher(document, bloco);
}

// Preenche todo elemento [data-campo] dentro de "onde" com os dados do bloco
function preencher(onde, bloco) {
  const d = bloco.dataset;
  const valores = {
    nome: d.nome, quando: `${d.inicio} às ${d.fim}`, servico: d.servico,
    com: d.com, whatsapp: d.whatsapp, origem: d.origem,
  };
  onde.querySelectorAll('[data-campo]').forEach((el) => {
    if (el.dataset.campo === 'status') el.innerHTML = STATUS[d.status];
    else if (valores[el.dataset.campo]) el.textContent = valores[el.dataset.campo];
  });
  const confirmar = onde.querySelector('[data-acao="confirmar"]');
  const pedir = onde.querySelector('[data-acao="pedir"]');
  if (confirmar) confirmar.hidden = d.status === 'confirmado';
  if (pedir) {
    pedir.hidden = d.status === 'confirmado';
    pedir.dataset.toast = `No produto, abre o WhatsApp com a mensagem: "Oi, ${d.nome}! Confirmando seu horário hoje às ${d.inicio} na Barbearia Exemplo. Você vem?"`;
  }
}

document.querySelectorAll('button.bloco').forEach((bloco) => {
  bloco.addEventListener('click', () => selecionar(bloco));
});

// ---------- Resumo do dia (contagens) ----------
function atualizarResumo() {
  const visiveis = [...document.querySelectorAll('button.bloco:not([hidden])')];
  const total = document.querySelector('[data-conta="total"]');
  if (!total) return;
  total.textContent = visiveis.length;
  document.querySelector('[data-conta="a-confirmar"]').textContent = visiveis.filter((b) => b.dataset.status === 'a-confirmar').length;
  document.querySelector('[data-conta="bloqueados"]').textContent = document.querySelectorAll('.grade .bloco--bloqueado').length;
}

// Atualiza a aparência do bloco (cor da borda + selo com texto)
function desenharStatus(bloco) {
  bloco.classList.toggle('bloco--confirmado', bloco.dataset.status === 'confirmado');
  bloco.classList.toggle('bloco--a-confirmar', bloco.dataset.status === 'a-confirmar');
  bloco.querySelector('[data-selo]').innerHTML = STATUS[bloco.dataset.status];
  bloco.setAttribute('aria-label', rotuloDoBloco(bloco));
}
const rotuloDoBloco = (b) => `${b.dataset.inicio} às ${b.dataset.fim}, ${b.dataset.nome}, ${b.dataset.servico.split(' ·')[0]}, ${b.dataset.status === 'confirmado' ? 'confirmado' : 'a confirmar'}`;
document.querySelectorAll('button.bloco').forEach((b) => b.setAttribute('aria-label', rotuloDoBloco(b)));

// ---------- Marcar como confirmado ----------
document.querySelector('[data-acao="confirmar"]')?.addEventListener('click', () => {
  if (!selecionado) return;
  selecionado.dataset.status = 'confirmado';
  desenharStatus(selecionado);
  preencher(document, selecionado);
  atualizarResumo();
  mostrarToast(`Presença de ${selecionado.dataset.nome} confirmada`);
});

// ---------- Cancelar (com "Desfazer") ----------
document.querySelector('#confirmar-cancelar')?.addEventListener('click', () => {
  const bloco = selecionado;
  if (!bloco) return;
  document.querySelector('#cancelar').close();
  document.querySelector('#detalhe')?.close(); // na agenda do celular, fecha a folha também
  bloco.hidden = true;
  selecionar(null);
  atualizarResumo();
  const avisar = document.querySelector('#avisar-cliente')?.checked;
  mostrarToast(
    `Agendamento de ${bloco.dataset.nome} cancelado.${avisar ? ' O WhatsApp abriria com o aviso pronto.' : ''}`,
    { acao: { texto: 'Desfazer', aoClicar: () => { bloco.hidden = false; selecionar(bloco); atualizarResumo(); bloco.focus(); } } },
  );
});

// ---------- Bloquear horário ----------
const formBloquear = document.querySelector('#form-bloquear');

function conflitos(coluna, inicio, fim) {
  // Agendamentos visíveis da coluna que se cruzam com o intervalo [inicio, fim)
  return [...document.querySelectorAll(`#coluna-${coluna} button.bloco:not([hidden])`)].filter((b) =>
    minutos(b.dataset.inicio) < minutos(fim) && minutos(b.dataset.fim) > minutos(inicio));
}

function verificarBloqueio() {
  const { profissional, inicio, fim } = formBloquear.elements;
  const aviso = formBloquear.querySelector('[data-aviso-conflito]');
  const erroHora = formBloquear.querySelector('[data-erro-hora]');
  const botao = document.querySelector('#botao-bloquear');
  const horaErrada = minutos(fim.value) <= minutos(inicio.value);
  erroHora.classList.toggle('esta-visivel', horaErrada);
  fim.setAttribute('aria-invalid', horaErrada ? 'true' : 'false');
  const lista = horaErrada ? [] : conflitos(profissional.value, inicio.value, fim.value);
  aviso.hidden = lista.length === 0;
  if (lista.length) {
    aviso.querySelector('[data-lista]').textContent = lista
      .map((b) => `${b.dataset.nome}, ${b.dataset.inicio} (${b.dataset.servico.split(' ·')[0]})`).join('; ');
  }
  botao.disabled = horaErrada || lista.length > 0;
}

if (formBloquear) {
  formBloquear.addEventListener('input', verificarBloqueio);
  document.querySelector('[data-abre="bloquear"]')?.addEventListener('click', verificarBloqueio);
  if (location.hash === '#bloquear') window.addEventListener('DOMContentLoaded', verificarBloqueio);

  formBloquear.addEventListener('submit', (evento) => {
    evento.preventDefault();
    verificarBloqueio();
    if (document.querySelector('#botao-bloquear').disabled) return;
    const { profissional, inicio, fim, motivo } = formBloquear.elements;
    const bloco = document.createElement('div');
    bloco.className = 'bloco bloco--bloqueado';
    bloco.style.setProperty('--de', linhaDaGrade(inicio.value));
    bloco.style.setProperty('--dura', (minutos(fim.value) - minutos(inicio.value)) / 10);
    bloco.innerHTML = `<span class="bloco__linha"><span class="icone icone-cadeado" aria-hidden="true"></span><span class="bloco__hora">${inicio.value} às ${fim.value}</span></span><span></span>`;
    bloco.lastElementChild.textContent = `Bloqueado${motivo.value ? ` · ${motivo.value}` : ''}`;
    document.querySelector(`#coluna-${profissional.value}`).append(bloco);
    document.querySelector('#bloquear').close();
    atualizarResumo();
    const nome = profissional.selectedOptions[0].textContent;
    mostrarToast(`Horário bloqueado: ${inicio.value} às ${fim.value} (${nome}). Ele já sumiu do seu link.`, {
      acao: { texto: 'Desfazer', aoClicar: () => { bloco.remove(); atualizarResumo(); } },
    });
  });
}

// ---------- Novo agendamento (cliente que ligou ou chegou no balcão) ----------
const formNovo = document.querySelector('#form-novo');
if (formNovo) {
  formNovo.noValidate = true;
  formNovo.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const { cliente, telefone, servico, profissional, horario } = formNovo.elements;
    const semNome = cliente.value.trim().length < 2;
    cliente.setAttribute('aria-invalid', semNome ? 'true' : 'false');
    if (semNome) { cliente.focus(); return; }

    const [nomeServico, duracao] = servico.value.split('|');
    const fim = `${String(Math.floor((minutos(horario.value) + +duracao) / 60)).padStart(2, '0')}:${String((minutos(horario.value) + +duracao) % 60).padStart(2, '0')}`;
    const bloco = document.createElement('button');
    bloco.type = 'button';
    bloco.className = 'bloco bloco--confirmado';
    Object.assign(bloco.dataset, {
      nome: cliente.value.trim(), inicio: horario.value, fim, status: 'confirmado',
      servico: servico.selectedOptions[0].textContent, com: profissional.selectedOptions[0].textContent,
      whatsapp: telefone.value || 'Não informado', origem: 'Adicionado por você',
    });
    bloco.style.setProperty('--de', linhaDaGrade(horario.value));
    bloco.style.setProperty('--dura', +duracao / 10);
    bloco.innerHTML = '<span class="bloco__linha"><span class="bloco__hora"></span><span class="bloco__nome"></span></span><span class="bloco__linha"><span></span><span data-selo></span></span>';
    bloco.querySelector('.bloco__hora').textContent = horario.value;
    bloco.querySelector('.bloco__nome').textContent = bloco.dataset.nome;
    bloco.querySelectorAll('.bloco__linha')[1].firstElementChild.textContent = nomeServico;
    desenharStatus(bloco);
    bloco.addEventListener('click', () => selecionar(bloco));
    document.querySelector(`#coluna-${profissional.value}`).append(bloco);
    document.querySelector('#novo').close();
    formNovo.reset();
    selecionar(bloco);
    atualizarResumo();
    mostrarToast(`Agendamento de ${bloco.dataset.nome} salvo às ${bloco.dataset.inicio}`);
  });
}

// ---------- Agenda no celular: tocar num item abre a folha de detalhes ----------
document.querySelectorAll('button.item-dia').forEach((item) => {
  item.addEventListener('click', () => {
    const folha = document.querySelector('#detalhe');
    selecionado = item;
    preencher(folha, item);
    if (!folha.open) folha.showModal();
  });
});
if (location.hash === '#detalhe') {
  window.addEventListener('DOMContentLoaded', () => document.querySelector('button.item-dia[data-nome="Lucas"]')?.click());
}

if (selecionado) preencher(document, selecionado);
