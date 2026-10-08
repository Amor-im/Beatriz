import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './core/footer/footer';
import { Header } from './core/header/header';
import { Toasts } from './core/toast/toasts';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, Toasts],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly conteudo = viewChild.required<ElementRef<HTMLElement>>('conteudo');

  /** Link "Pular para o conteúdo": leva o foco do teclado direto para o <main>. */
  pularParaConteudo(): void {
    this.conteudo().nativeElement.focus();
  }
}
