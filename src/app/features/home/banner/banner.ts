import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto } from '../../../model/produto';
import { ImagemReserva, IMAGEM_RESERVA } from '../../../shared/diretivas/imagem-reserva';
import { EtiquetaPreco } from '../../../shared/etiqueta-preco/etiqueta-preco';

/** Abertura da home: o texto da loja e uma "vitrine" com três produtos na prateleira. */
@Component({
  selector: 'app-banner',
  imports: [NgOptimizedImage, RouterLink, EtiquetaPreco, ImagemReserva],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  destaques = input<Produto[]>([]);
  carregando = input(false);

  protected readonly imagemReserva = IMAGEM_RESERVA;
}
