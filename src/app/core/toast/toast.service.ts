import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  texto: string;
  /** "aviso" troca o ícone de confirmação por um de atenção. */
  tipo: 'sucesso' | 'aviso';
  /** Link opcional, ex.: "Ver carrinho". */
  link?: { rotulo: string; rota: string };
}

/** Quanto tempo cada aviso fica na tela (o tempo para enquanto o mouse ou o foco estiver nele). */
export const DURACAO_TOAST_MS = 5000;
const MAXIMO_NA_TELA = 3;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private proximoId = 1;
  private readonly temporizadores = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  mostrar(texto: string, link?: Toast['link'], tipo: Toast['tipo'] = 'sucesso'): void {
    const toast: Toast = { id: this.proximoId++, texto, tipo, link };
    const lista = [...this._toasts(), toast];
    // Mantém no máximo 3 avisos empilhados; os mais antigos saem.
    lista.slice(0, -MAXIMO_NA_TELA).forEach((antigo) => this.pausar(antigo.id));
    this._toasts.set(lista.slice(-MAXIMO_NA_TELA));
    this.retomar(toast.id);
  }

  fechar(id: number): void {
    this.pausar(id);
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  /** Para a contagem (mouse em cima ou foco do teclado dentro do aviso). */
  pausar(id: number): void {
    clearTimeout(this.temporizadores.get(id));
    this.temporizadores.delete(id);
  }

  /** Recomeça a contagem para fechar sozinho. */
  retomar(id: number): void {
    this.pausar(id);
    this.temporizadores.set(
      id,
      setTimeout(() => this.fechar(id), DURACAO_TOAST_MS),
    );
  }
}
