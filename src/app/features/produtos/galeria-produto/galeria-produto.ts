import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ImagemReserva, IMAGEM_RESERVA } from '../../../shared/diretivas/imagem-reserva';

/**
 * Galeria do detalhe: imagem principal com zoom e miniaturas.
 * A Fake Store API manda uma foto por produto; as miniaturas aparecem quando houver mais de uma.
 */
@Component({
  selector: 'app-galeria-produto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ImagemReserva],
  templateUrl: './galeria-produto.html',
  styleUrl: './galeria-produto.css',
})
export class GaleriaProduto {
  imagens = input.required<string[]>();
  nome = input.required<string>();

  protected readonly indiceAtual = signal(0);
  protected readonly ampliada = signal(false);
  /** Ponto da foto que fica no centro do zoom (em %), segue o ponteiro. */
  protected readonly origemZoom = signal('50% 50%');

  protected readonly imagemAtual = computed(
    () => this.imagens()[this.indiceAtual()] || IMAGEM_RESERVA,
  );

  selecionar(indice: number): void {
    this.indiceAtual.set(indice);
    this.ampliada.set(false);
  }

  alternarZoom(): void {
    this.ampliada.update((v) => !v);
    if (!this.ampliada()) {
      this.origemZoom.set('50% 50%');
    }
  }

  moverZoom(evento: PointerEvent): void {
    if (!this.ampliada()) return;
    const area = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((evento.clientX - area.left) / area.width) * 100;
    const y = ((evento.clientY - area.top) / area.height) * 100;
    this.origemZoom.set(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
}
