import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Seletor de quantidade (− 1 +).
 * `model()` cria um input com two-way binding: o pai usa [(contador)]="quantidade".
 */
@Component({
  selector: 'app-quantidade-controle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './quantidade-controle.html',
  styleUrl: './quantidade-controle.css',
})
export class QuantidadeControle {
  contador = model<number>(1);
  min = input(1);
  max = input(10);
  /** Nome do produto, para o leitor de tela dizer "Diminuir quantidade de Mochila". */
  rotulo = input('');

  decrementar(): void {
    this.contador.set(Math.max(this.min(), this.contador() - 1));
  }

  incrementar(): void {
    this.contador.set(Math.min(this.max(), this.contador() + 1));
  }
}
