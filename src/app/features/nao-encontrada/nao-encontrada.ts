import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EstadoVazio } from '../../shared/estado-vazio/estado-vazio';

/** Página 404: aparece para qualquer endereço que não existe (rota '**'). */
@Component({
  selector: 'app-nao-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EstadoVazio],
  template: `
    <div class="largura-pagina">
      <app-estado-vazio titulo="Página não encontrada" [nivel]="1">
        <p>
          O endereço <code>{{ endereco }}</code> não existe nesta loja. Ele pode ter sido digitado errado ou
          a página mudou de lugar.
        </p>
        <span acoes>
          <a class="botao botao--primario" routerLink="/produtos">Ver produtos</a>
          <a class="botao botao--secundario" routerLink="/">Ir para o início</a>
        </span>
      </app-estado-vazio>
    </div>
  `,
  styles: `
    code {
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--cor-vidro);
      color: var(--cor-tinta);
      word-break: break-all;
    }
    [acoes] {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--espaco-1);
    }
  `,
})
export class NaoEncontrada {
  protected readonly endereco = inject(Router).url;
}
