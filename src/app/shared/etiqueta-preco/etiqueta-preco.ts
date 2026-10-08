import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DESCONTO_PROMO } from '../../model/produto';
import { DescontoPipe } from '../pipes/desconto-pipe';

/** Preço em formato de etiqueta de loja. Em promoção, mostra o preço antigo riscado. */
@Component({
  selector: 'app-etiqueta-preco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DescontoPipe],
  templateUrl: './etiqueta-preco.html',
  styleUrl: './etiqueta-preco.css',
  host: { '[class.grande]': "tamanho() === 'grande'" },
})
export class EtiquetaPreco {
  preco = input.required<number>();
  /** Em promoção, aplica o desconto e mostra o preço antigo riscado. */
  promo = input<boolean | undefined>(false);
  tamanho = input<'normal' | 'grande'>('normal');

  protected readonly desconto = DESCONTO_PROMO;
}
