import { Pipe, PipeTransform } from '@angular/core';
import { aplicarDesconto } from '../../model/produto';

/**
 * Aplica um desconto percentual a um valor.
 * Uso: {{ produto.preco | desconto: 10 | currency }}
 */
@Pipe({
  name: 'desconto',
  pure: true,
})
export class DescontoPipe implements PipeTransform {
  transform(valor: number | undefined | null, percentual = 0): number {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 0;
    }
    // A conta fica no model para o carrinho e o pipe usarem exatamente a mesma regra.
    return aplicarDesconto(valor, percentual);
  }
}
