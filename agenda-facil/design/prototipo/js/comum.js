// =========================================================
// Agenda Fácil · comportamentos comuns do protótipo
// JavaScript simples, sem biblioteca. Sem ele, as páginas abrem
// e os links funcionam; ele só deixa o protótipo mais realista.
// =========================================================

// ---------- Toast ----------
// Mostra uma mensagem curta no rodapé. Quem lê a tela anuncia
// sozinho porque a área tem role="status".
let temporizadorToast;

function mostrarToast(texto, opcoes = {}) {
  let area = document.querySelector('.toast-area');
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    document.body.append(area);
  }
  const icone = opcoes.erro ? 'icone-alerta' : 'icone-check';
  area.innerHTML = `
    <div class="toast">
      <span class="icone ${icone}" aria-hidden="true"></span>
      <span class="toast__texto"></span>
    </div>`;
  area.querySelector('.toast__texto').textContent = texto;

  if (opcoes.acao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'toast__acao';
    botao.textContent = opcoes.acao.texto;
    botao.addEventListener('click', () => {
      opcoes.acao.aoClicar();
      area.innerHTML = '';
    });
    area.querySelector('.toast').append(botao);
  }

  clearTimeout(temporizadorToast);
  // Com ação ("Desfazer"), fica mais tempo na tela para dar tempo de clicar.
  temporizadorToast = setTimeout(() => { area.innerHTML = ''; }, opcoes.acao ? 8000 : 5000);
}

// ---------- Janelas (elemento <dialog>) ----------
// data-abre="id" abre a janela; data-fecha fecha a janela em que está.
// O <dialog> com showModal() já prende o foco dentro da janela e fecha com Esc.
document.addEventListener('click', (evento) => {
  const abre = evento.target.closest('[data-abre]');
  if (abre) {
    document.getElementById(abre.dataset.abre)?.showModal();
  }
  const fecha = evento.target.closest('[data-fecha]');
  if (fecha) {
    fecha.closest('dialog')?.close();
  }
});

// Abrir uma janela pelo endereço (ex.: agenda.html#cancelar). Uso para os prints das telas.
window.addEventListener('DOMContentLoaded', () => {
  const alvo = location.hash && document.querySelector(`dialog${location.hash}`);
  if (alvo) alvo.showModal();
});

// ---------- Chips que ligam e desligam ----------
document.addEventListener('click', (evento) => {
  const chip = evento.target.closest('button.chip[aria-pressed]');
  if (chip) {
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  }
});

// ---------- Copiar link ----------
document.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('[data-copiar]');
  if (!botao) return;
  try {
    await navigator.clipboard.writeText(botao.dataset.copiar);
    mostrarToast('Link copiado');
  } catch {
    // Alguns navegadores não deixam copiar em página aberta direto do disco (file://).
    mostrarToast('Não deu para copiar aqui. Selecione o link e copie à mão.', { erro: true });
  }
});

// ---------- Botões que, no protótipo, só explicam o que fariam ----------
document.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-toast]');
  if (botao) {
    evento.preventDefault();
    mostrarToast(botao.dataset.toast);
  }
});
