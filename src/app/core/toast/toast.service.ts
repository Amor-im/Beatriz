import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  texto: string;
  /** Link opcional, ex.: "Ver carrinho". */
  link?: { rotulo: string; rota: string };
}

/** Quanto tempo cada aviso fica na tela. */
export const DURACAO_TOAST_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private proximoId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  mostrar(texto: string, link?: Toast['link']): void {
    const toast: Toast = { id: this.proximoId++, texto, link };
    // Mantém no máximo 3 avisos empilhados.
    this._toasts.update((lista) => [...lista, toast].slice(-3));
    setTimeout(() => this.fechar(toast.id), DURACAO_TOAST_MS);
  }

  fechar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
