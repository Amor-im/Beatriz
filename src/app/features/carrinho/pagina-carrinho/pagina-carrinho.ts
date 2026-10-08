import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast/toast.service';
import { precoFinal, rotuloCategoria } from '../../../model/produto';
import { ImagemReserva } from '../../../shared/diretivas/imagem-reserva';
import { EstadoVazio } from '../../../shared/estado-vazio/estado-vazio';
import { QuantidadeControle } from '../../../shared/quantidade-controle/quantidade-controle';
import { atualizarCarrinhoComCatalogo } from '../atualizar-carrinho';
import { CarrinhoService, ItemCarrinho, QUANTIDADE_MAXIMA } from '../carrinho.service';
import { FRETE_GRATIS_A_PARTIR_DE } from '../frete';
import { ResumoPedido } from '../resumo-pedido/resumo-pedido';

@Component({
  selector: 'app-pagina-carrinho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, EstadoVazio, QuantidadeControle, ImagemReserva, ResumoPedido],
  templateUrl: './pagina-carrinho.html',
  styleUrl: './pagina-carrinho.css',
})
export class PaginaCarrinho {
  protected readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);

  protected readonly quantidadeMaxima = QUANTIDADE_MAXIMA;
  protected readonly precoFinal = precoFinal;
  protected readonly rotuloCategoria = rotuloCategoria;

  constructor() {
    // O carrinho salvo pode ter preço antigo: atualiza com o catálogo atual.
    atualizarCarrinhoComCatalogo();
  }

  /** Progresso até o frete grátis (0 a 100), para a barra. floor: só enche quando atingir de verdade. */
  protected readonly progressoFrete = computed(() =>
    Math.min(100, Math.floor((this.carrinho.subtotal() / FRETE_GRATIS_A_PARTIR_DE) * 100)),
  );

  alterarQuantidade(item: ItemCarrinho, quantidade: number): void {
    this.carrinho.alterarQuantidade(item.produto.id, quantidade);
  }

  remover(item: ItemCarrinho): void {
    this.carrinho.remover(item.produto.id);
    this.toast.mostrar('Produto removido do carrinho');
  }
}
