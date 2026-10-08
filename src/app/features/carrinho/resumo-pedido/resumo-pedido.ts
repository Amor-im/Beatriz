import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { precoFinal } from '../../../model/produto';
import { EtiquetaPreco } from '../../../shared/etiqueta-preco/etiqueta-preco';
import { CarrinhoService } from '../carrinho.service';

/** Caixa com subtotal, frete e total. Usada no carrinho e no checkout; o botão vem por <ng-content>. */
@Component({
  selector: 'app-resumo-pedido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, EtiquetaPreco],
  templateUrl: './resumo-pedido.html',
  styleUrl: './resumo-pedido.css',
})
export class ResumoPedido {
  protected readonly carrinho = inject(CarrinhoService);
  protected readonly precoFinal = precoFinal;

  /** No checkout, lista os itens de forma compacta. */
  mostrarItens = input(false);
}
