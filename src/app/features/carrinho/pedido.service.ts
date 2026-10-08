import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { CarrinhoService, ItemCarrinho } from './carrinho.service';

export type FormaPagamento = 'pix' | 'cartao' | 'boleto';

export interface DadosEntrega {
  nome: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  pagamento: FormaPagamento;
}

export interface Pedido {
  numero: string;
  data: Date;
  itens: ItemCarrinho[];
  subtotal: number;
  frete: number;
  total: number;
  entrega: DadosEntrega;
}

/** Tempo fingindo uma chamada ao servidor, para a tela mostrar o estado "Confirmando…". */
export const ATRASO_SIMULADO_MS = 800;

/**
 * Checkout simulado: monta o pedido a partir do carrinho, sem servidor e sem pagamento.
 * Quem esvazia o carrinho é a tela de checkout, depois de abrir a confirmação
 * (assim o resumo não "pisca" com total zerado enquanto a próxima página carrega).
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly carrinho = inject(CarrinhoService);

  private readonly _ultimoPedido = signal<Pedido | null>(null);
  readonly ultimoPedido = this._ultimoPedido.asReadonly();

  finalizar(entrega: DadosEntrega): Observable<Pedido> {
    const pedido: Pedido = {
      numero: gerarNumeroPedido(),
      data: new Date(),
      itens: this.carrinho.itens(),
      subtotal: this.carrinho.subtotal(),
      frete: this.carrinho.frete(),
      total: this.carrinho.total(),
      entrega,
    };

    return of(pedido).pipe(
      delay(ATRASO_SIMULADO_MS),
      tap((p) => this._ultimoPedido.set(p)),
    );
  }
}

/** Ex.: "VT-K3F9Q2". Número fictício, só para exibição. */
function gerarNumeroPedido(): string {
  return 'VT-' + Date.now().toString(36).slice(-6).toUpperCase();
}
