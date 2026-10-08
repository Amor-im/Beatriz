import { CurrencyPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { precoFinal } from '../../../model/produto';
import { EtiquetaPreco } from '../../../shared/etiqueta-preco/etiqueta-preco';
import { CarrinhoService } from '../carrinho.service';
import { FRETE_GRATIS_A_PARTIR_DE } from '../frete';

/** Caixa com subtotal, frete e total. Usada no carrinho e no checkout; o botão vem por <ng-content>. */
@Component({
  selector: 'app-resumo-pedido',
  imports: [CurrencyPipe, EtiquetaPreco],
  templateUrl: './resumo-pedido.html',
  styleUrl: './resumo-pedido.css',
})
export class ResumoPedido {
  protected readonly carrinho = inject(CarrinhoService);
  protected readonly precoFinal = precoFinal;
  protected readonly freteGratisAPartirDe = FRETE_GRATIS_A_PARTIR_DE;

  /** No checkout, lista os itens de forma compacta. */
  mostrarItens = input(false);
}
