import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { precoFinal } from '../../../model/produto';
import { EstadoVazio } from '../../../shared/estado-vazio/estado-vazio';
import { PedidoService } from '../pedido.service';

@Component({
  selector: 'app-pedido-confirmado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, EstadoVazio],
  templateUrl: './pedido-confirmado.html',
  styleUrl: './pedido-confirmado.css',
})
export class PedidoConfirmado {
  protected readonly pedido = inject(PedidoService).ultimoPedido;
  protected readonly precoFinal = precoFinal;
  protected readonly primeiroNome = computed(
    () => this.pedido()?.entrega.nome.trim().split(/\s+/)[0] ?? '',
  );
  protected readonly rotulosPagamento = { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto' };

  private readonly titulo = viewChild<ElementRef<HTMLElement>>('titulo');

  constructor() {
    // Leva o foco para o título: quem usa leitor de tela ouve a confirmação logo de cara.
    afterNextRender(() => this.titulo()?.nativeElement.focus());
  }
}
