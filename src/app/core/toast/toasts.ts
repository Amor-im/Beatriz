import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from './toast.service';

/** Área fixa onde os avisos aparecem. Fica sempre no DOM para o leitor de tela anunciar as mudanças. */
@Component({
  selector: 'app-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './toasts.html',
  styleUrl: './toasts.css',
})
export class Toasts {
  protected readonly toastService = inject(ToastService);
}
