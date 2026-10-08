import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const NOME_LOJA = 'Vitrine';

/** Monta o texto da aba do navegador: "Produtos | Vitrine". */
export function formatarTitulo(titulo?: string): string {
  return titulo ? `${titulo} | ${NOME_LOJA}` : NOME_LOJA;
}

/**
 * O Router chama esta classe a cada navegação. Ela lê o `title` da rota
 * (definido em app.routes.ts) e acrescenta o nome da loja.
 */
@Injectable({ providedIn: 'root' })
export class TituloPaginaStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(formatarTitulo(this.buildTitle(snapshot)));
  }
}
