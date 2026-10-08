import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarrinhoService } from '../../features/carrinho/carrinho.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly carrinho = inject(CarrinhoService);

  protected readonly quantidade = this.carrinho.quantidadeTotal;

  /** Texto lido pelo leitor de tela no botão do carrinho. */
  protected readonly rotuloCarrinho = computed(() => {
    const qtd = this.quantidade();
    if (qtd === 0) return 'Carrinho, vazio';
    return `Carrinho, ${qtd} ${qtd === 1 ? 'item' : 'itens'}`;
  });
}
