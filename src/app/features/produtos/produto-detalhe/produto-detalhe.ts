import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, merge, of, Subject, switchMap } from 'rxjs';
import { formatarTitulo } from '../../../core/titulo-pagina.strategy';
import { ToastService } from '../../../core/toast/toast.service';
import { DESCONTO_PROMO, Produto, rotuloCategoria } from '../../../model/produto';
import { EstadoVazio } from '../../../shared/estado-vazio/estado-vazio';
import { EtiquetaPreco } from '../../../shared/etiqueta-preco/etiqueta-preco';
import { Truncar } from '../../../shared/pipes/truncar-pipe';
import { QuantidadeControle } from '../../../shared/quantidade-controle/quantidade-controle';
import { CarrinhoService, QUANTIDADE_MAXIMA } from '../../carrinho/carrinho.service';
import { FRETE_GRATIS_A_PARTIR_DE } from '../../carrinho/frete';
import { GaleriaProduto } from '../galeria-produto/galeria-produto';
import { ProdutoService } from '../produto.service';

type Resultado =
  | { estado: 'carregando' }
  | { estado: 'pronto'; produto: Produto }
  | { estado: 'nao-encontrado' }
  | { estado: 'erro' };

@Component({
  selector: 'app-produto-detalhe',
  imports: [
    RouterLink,
    DecimalPipe,
    GaleriaProduto,
    EtiquetaPreco,
    QuantidadeControle,
    EstadoVazio,
    Truncar,
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css',
})
export class ProdutoDetalhe {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  id = input.required<string>();

  protected readonly resultado = signal<Resultado>({ estado: 'carregando' });
  protected readonly produto = computed(() => {
    const r = this.resultado();
    return r.estado === 'pronto' ? r.produto : undefined;
  });
  protected readonly categoria = computed(() => rotuloCategoria(this.produto()?.categoria ?? ''));
  protected readonly quantidade = signal(1);
  protected readonly quantidadeMaxima = QUANTIDADE_MAXIMA;
  protected readonly desconto = DESCONTO_PROMO;
  protected readonly freteGratisAPartirDe = FRETE_GRATIS_A_PARTIR_DE;

  private readonly tentarDeNovo$ = new Subject<void>();

  constructor() {
    // Sempre que o :id muda (ou a pessoa clica em "Tentar de novo"), busca o produto.
    // switchMap cancela a requisição anterior se o id trocar antes da resposta chegar.
    merge(toObservable(this.id), this.tentarDeNovo$.pipe(map(() => this.id())))
      .pipe(
        switchMap((id) => {
          this.resultado.set({ estado: 'carregando' });
          this.quantidade.set(1);
          const numero = Number(id);
          if (!Number.isInteger(numero) || numero <= 0) {
            return of<Resultado>({ estado: 'nao-encontrado' });
          }
          return this.produtoService.buscarPorId(numero).pipe(
            map((produto): Resultado =>
              produto ? { estado: 'pronto', produto } : { estado: 'nao-encontrado' },
            ),
            catchError(() => of<Resultado>({ estado: 'erro' })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.resultado.set(resultado);
        if (resultado.estado === 'pronto') {
          this.title.setTitle(formatarTitulo(resultado.produto.nome));
        } else if (resultado.estado === 'nao-encontrado') {
          this.title.setTitle(formatarTitulo('Produto não encontrado'));
        }
      });
  }

  tentarDeNovo(): void {
    this.tentarDeNovo$.next();
  }

  adicionarAoCarrinho(produto: Produto): void {
    const qtd = this.quantidade();
    this.carrinho.adicionar(produto, qtd);
    this.toast.mostrar(
      qtd === 1 ? '1 unidade adicionada ao carrinho' : `${qtd} unidades adicionadas ao carrinho`,
      { rotulo: 'Ver carrinho', rota: '/carrinho' },
    );
  }
}
