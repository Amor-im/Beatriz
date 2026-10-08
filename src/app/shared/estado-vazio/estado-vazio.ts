import { Component, input } from '@angular/core';

/** Bloco para telas sem conteúdo (carrinho vazio, busca sem resultado, 404). O texto e os botões vêm por <ng-content>. */
@Component({
  selector: 'app-estado-vazio',
  templateUrl: './estado-vazio.html',
  styleUrl: './estado-vazio.css',
})
export class EstadoVazio {
  titulo = input.required<string>();
  /** Nível do título: h1 quando o bloco é a página inteira (ex.: 404), h2 dentro de uma página. */
  nivel = input<1 | 2>(2);
}
