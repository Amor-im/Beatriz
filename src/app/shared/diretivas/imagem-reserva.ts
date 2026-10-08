import { Directive, ElementRef, inject } from '@angular/core';

export const IMAGEM_RESERVA = 'images/produto-sem-imagem.svg';

/** Se a imagem não carregar (link quebrado, API fora do ar), mostra uma ilustração no lugar. */
@Directive({
  selector: 'img[appImagemReserva]',
  host: { '(error)': 'usarReserva()' },
})
export class ImagemReserva {
  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  usarReserva(): void {
    // Evita laço infinito caso a própria imagem reserva falhe.
    if (!this.img.src.endsWith(IMAGEM_RESERVA)) {
      this.img.removeAttribute('srcset');
      this.img.src = IMAGEM_RESERVA;
    }
  }
}
