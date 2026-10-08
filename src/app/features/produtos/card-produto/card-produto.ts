import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto, rotuloCategoria } from '../../../model/produto';
import { ImagemReserva, IMAGEM_RESERVA } from '../../../shared/diretivas/imagem-reserva';
import { EtiquetaPreco } from '../../../shared/etiqueta-preco/etiqueta-preco';

/**
 * Card de apresentação: recebe o produto por input() e avisa o pai por output().
 * Ele não sabe que existe um carrinho; quem decide o que fazer é a página.
 */
@Component({
  selector: 'app-card-produto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, EtiquetaPreco, ImagemReserva],
  templateUrl: './card-produto.html',
  styleUrl: './card-produto.css',
})
export class CardProduto {
  produto = input.required<Produto>();
  /** Modo prévia (tela de cadastro): sem link e sem botão ativo. */
  previa = input(false);
  /** Imagens visíveis logo ao abrir a página carregam com prioridade (melhora o LCP). */
  prioridade = input(false);

  adicionar = output<Produto>();

  protected readonly esgotado = computed(() => this.produto().estado === 'esgotado');
  protected readonly categoria = computed(() => rotuloCategoria(this.produto().categoria));
  protected readonly imagem = computed(() => this.produto().imageUrl || IMAGEM_RESERVA);

  onAdicionar(): void {
    this.adicionar.emit(this.produto());
  }
}
