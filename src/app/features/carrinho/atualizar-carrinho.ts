import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../core/toast/toast.service';
import { ProdutoService } from '../produtos/produto.service';
import { CarrinhoService } from './carrinho.service';

/**
 * Chamada no construtor das páginas de carrinho e checkout (precisa do contexto de injeção,
 * por causa do inject()). Busca o catálogo atual e atualiza preço, promoção e estoque dos
 * itens salvos. Se algum esgotou, avisa. Se o catálogo não carregar, o carrinho fica como está.
 */
export function atualizarCarrinhoComCatalogo(): void {
  const carrinho = inject(CarrinhoService);
  const toast = inject(ToastService);

  inject(ProdutoService)
    .listar()
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: (catalogo) => {
        const removidos = carrinho.atualizarProdutos(catalogo);
        if (removidos > 0) {
          toast.mostrar(
            removidos === 1
              ? 'Um produto esgotou e saiu do carrinho'
              : `${removidos} produtos esgotaram e saíram do carrinho`,
            undefined,
            'aviso',
          );
        }
      },
      error: () => undefined,
    });
}
