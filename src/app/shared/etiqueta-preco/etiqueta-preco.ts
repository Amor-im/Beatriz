import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { DESCONTO_PROMO, Produto } from '../../model/produto';
import { DescontoPipe } from '../pipes/desconto-pipe';

/** Preço em formato de etiqueta de loja. Em promoção, mostra o preço antigo riscado. */
@Component({
  selector: 'app-etiqueta-preco',
  imports: [CurrencyPipe, DescontoPipe],
  templateUrl: './etiqueta-preco.html',
  styleUrl: './etiqueta-preco.css',
  host: { '[class.grande]': "tamanho() === 'grande'" },
})
export class EtiquetaPreco {
  produto = input.required<Pick<Produto, 'preco' | 'promo'>>();
  tamanho = input<'normal' | 'grande'>('normal');

  protected readonly desconto = DESCONTO_PROMO;
}
