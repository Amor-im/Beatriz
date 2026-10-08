// =========================================================
// Agenda Fácil · fluxo do cliente (página pública)
// As escolhas (serviço, profissional, dia, hora) viajam no endereço
// da página: profissional.html?servico=corte → horario.html?servico=corte&profissional=rafa ...
// Assim o botão Voltar do navegador funciona e não preciso guardar nada.
// =========================================================

// Dados de exemplo do protótipo (no produto, vêm do servidor)
const CATALOGO = {
  negocio: 'Barbearia Exemplo',
  endereco: 'Rua Exemplo, 123 · Centro',
  servicos: {
    corte: { nome: 'Corte', duracao: 40, preco: 'R$ 45' },
    barba: { nome: 'Barba', duracao: 30, preco: 'R$ 35' },
    'corte-barba': { nome: 'Corte e barba', duracao: 70, preco: 'R$ 70' },
    sobrancelha: { nome: 'Sobrancelha', duracao: 20, preco: 'R$ 20' },
  },
  profissionais: { rafa: 'Rafa', julia: 'Júlia', 'sem-preferencia': 'Sem preferência' },
};

const escolhas = new URLSearchParams(location.search);
const servico = CATALOGO.servicos[escolhas.get('servico')] ?? CATALOGO.servicos.corte;
const dia = escolhas.get('dia') ?? '2026-10-08';
const hora = escolhas.get('hora') ?? '16:20';

// "Sem preferência": quem atende é quem estava livre no horário escolhido (vem em "com")
function nomeProfissional() {
  const escolhido = escolhas.get('profissional');
  if (escolhido && escolhido !== 'sem-preferencia') return CATALOGO.profissionais[escolhido];
  return CATALOGO.profissionais[escolhas.get('com')] ?? 'Rafa';
}

function somarMinutos(horaTexto, minutos) {
  const [h, m] = horaTexto.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// "2026-10-08" → { semana: "quinta-feira", dia: "8 de outubro" }
function formatarDia(dataTexto) {
  const data = new Date(`${dataTexto}T12:00:00Z`);
  const semana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(data);
  const diaMes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(data);
  return { semana, dia: diaMes };
}

// ---------- 1. Levar as escolhas para a próxima página ----------
// Todo link com data-leva recebe as escolhas que já estão no endereço.
document.querySelectorAll('a[data-leva]').forEach((link) => {
  const destino = new URL(link.getAttribute('href'), location.href);
  for (const [chave, valor] of escolhas) {
    if (!destino.searchParams.has(chave)) destino.searchParams.set(chave, valor);
  }
  link.href = destino.href;
});

// ---------- 2. Mostrar as escolhas na tela ----------
const { semana, dia: diaMes } = formatarDia(dia);
const textos = {
  'servico-nome': servico.nome,
  'servico-info': `${servico.duracao} min · ${servico.preco}`,
  'servico-preco': servico.preco,
  'servico-duracao': `${servico.duracao} min`,
  profissional: nomeProfissional(),
  'dia-semana': semana,
  'dia-mes': diaMes,
  'dia-completo': `${semana}, ${diaMes}`,
  hora,
  'hora-fim': somarMinutos(hora, servico.duracao),
  nome: (escolhas.get('nome') ?? 'Lucas').split(' ')[0],
};
document.querySelectorAll('[data-mostra]').forEach((elemento) => {
  const texto = textos[elemento.dataset.mostra];
  if (texto) elemento.textContent = texto;
});
// Aviso de que o sistema escolheu o profissional
if (escolhas.get('profissional') === 'sem-preferencia') {
  document.querySelectorAll('[data-se-sem-preferencia]').forEach((elemento) => { elemento.hidden = false; });
}

// ---------- 3. Formulário "Seus dados" ----------
const form = document.querySelector('#form-dados');

// Máscara do WhatsApp: (00) 00000-0000
function mascararTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function marcarErro(campo, temErro) {
  campo.setAttribute('aria-invalid', temErro ? 'true' : 'false');
}

if (form) {
  // Com JavaScript, quem mostra os erros sou eu (mensagens melhores que as do navegador).
  form.noValidate = true;
  const nome = form.querySelector('#nome');
  const whatsapp = form.querySelector('#whatsapp');
  const botao = form.querySelector('button[type="submit"]');

  whatsapp.addEventListener('input', () => {
    whatsapp.value = mascararTelefone(whatsapp.value);
  });

  // Se a pessoa já está tocando em "Confirmar", não valido no blur: a mensagem de erro
  // empurraria o botão para baixo e o toque cairia fora dele. O envio mostra os erros de uma vez.
  let indoEnviar = false;
  botao.addEventListener('pointerdown', () => { indoEnviar = true; });
  document.addEventListener('pointerup', () => { setTimeout(() => { indoEnviar = false; }, 0); });

  // Erro aparece quando a pessoa sai do campo (não a cada tecla) e some assim que ela corrige.
  nome.addEventListener('blur', () => { if (nome.value && !indoEnviar) marcarErro(nome, nome.value.trim().length < 2); });
  whatsapp.addEventListener('blur', () => { if (whatsapp.value && !indoEnviar) marcarErro(whatsapp, !telefoneValido()); });
  nome.addEventListener('input', () => { if (nome.getAttribute('aria-invalid') === 'true') marcarErro(nome, nome.value.trim().length < 2); });
  whatsapp.addEventListener('input', () => { if (whatsapp.getAttribute('aria-invalid') === 'true') marcarErro(whatsapp, !telefoneValido()); });

  function telefoneValido() {
    const digitos = whatsapp.value.replace(/\D/g, '');
    return digitos.length === 10 || digitos.length === 11;
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nomeErrado = nome.value.trim().length < 2;
    const telefoneErrado = !telefoneValido();
    marcarErro(nome, nomeErrado);
    marcarErro(whatsapp, telefoneErrado);

    // Foco no primeiro campo com erro: o leitor de tela lê o rótulo e a mensagem.
    if (nomeErrado) { nome.focus(); return; }
    if (telefoneErrado) { whatsapp.focus(); return; }

    // Carregando: muda o texto, desabilita (evita marcar duas vezes) e segue.
    botao.disabled = true;
    botao.classList.add('esta-carregando');
    botao.textContent = 'Confirmando…';
    const destino = new URL(form.getAttribute('action'), location.href);
    for (const [chave, valor] of escolhas) destino.searchParams.set(chave, valor);
    destino.searchParams.set('nome', nome.value.trim());
    setTimeout(() => { location.href = destino.href; }, 900);
  });
}

// ---------- 4. Comprovante ----------
// Salvar na agenda do celular: gera um arquivo .ics (o formato que Google Agenda e iPhone entendem)
document.querySelector('[data-baixar-ics]')?.addEventListener('click', () => {
  const [ano, mes, d] = dia.split('-');
  const inicio = `${ano}${mes}${d}T${hora.replace(':', '')}00`;
  const fim = `${ano}${mes}${d}T${somarMinutos(hora, servico.duracao).replace(':', '')}00`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Agenda Facil//Prototipo//PT',
    'BEGIN:VEVENT',
    `UID:${inicio}@agendafacil.example`,
    `DTSTAMP:${inicio}`,
    `DTSTART;TZID=America/Sao_Paulo:${inicio}`,
    `DTEND;TZID=America/Sao_Paulo:${fim}`,
    `SUMMARY:${servico.nome} com ${nomeProfissional()} · ${CATALOGO.negocio}`,
    `LOCATION:${CATALOGO.endereco}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  link.download = 'meu-horario.ics';
  link.click();
  mostrarToast('Arquivo do horário baixado. Abra para salvar na agenda.');
});

// Mandar o comprovante no WhatsApp: abre o WhatsApp com o texto pronto para a pessoa escolher o contato (ela mesma, por exemplo)
const linkWhatsapp = document.querySelector('[data-whatsapp-comprovante]');
if (linkWhatsapp) {
  const texto = `Meu horário na ${CATALOGO.negocio}: ${servico.nome} com ${nomeProfissional()}, ${semana}, ${diaMes}, às ${hora}. ${CATALOGO.endereco}. Para remarcar ou cancelar: https://agendafacil.example/barbearia-exemplo/meu-horario`;
  linkWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

// ---------- 5. Meu horário: cancelar ----------
document.querySelector('#confirmar-cancelamento')?.addEventListener('click', () => {
  document.querySelector('#cancelar-horario').close();
  document.querySelector('#estado-horario').innerHTML =
    '<span class="status status--cancelado"><span class="icone icone-x" aria-hidden="true"></span>Cancelado</span>';
  document.querySelector('#acoes-horario').hidden = true;
  document.querySelector('#horario-cancelado').hidden = false;
  mostrarToast('Agendamento cancelado. O horário ficou livre para outra pessoa.');
});
