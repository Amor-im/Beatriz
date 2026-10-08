import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ToastService } from '../../../core/toast/toast.service';
import { CATEGORIAS, Produto, rotuloCategoria } from '../../../model/produto';
import { EstadoVazio } from '../../../shared/estado-vazio/estado-vazio';
import { CarrinhoService } from '../../carrinho/carrinho.service';
import { CardProduto } from '../card-produto/card-produto';
import { filtrarProdutos, OPCOES_ORDENACAO, Ordenacao } from '../filtro-produtos';
import { ProdutoService } from '../produto.service';

type EstadoTela = 'carregando' | 'pronto' | 'erro';

@Component({
  selector: 'app-lista-produtos',
  imports: [CardProduto, RouterLink, EstadoVazio],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css',
})
export class ListaProdutos {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // Query params da URL (?busca=ssd&categoria=eletronicos&ordem=menor-preco&promo=1).
  // Chegam como input() graças ao withComponentInputBinding() no app.config.ts.
  busca = input<string>();
  categoria = input<string>();
  ordem = input<string>();
  promo = input<string>();

  protected readonly categorias = CATEGORIAS;
  protected readonly opcoesOrdenacao = OPCOES_ORDENACAO;
  protected readonly esqueletos = Array.from({ length: 8 }, (_, i) => i);

  protected readonly estado = signal<EstadoTela>('carregando');
  private readonly produtos = signal<Produto[]>([]);
  protected readonly origem = this.produtoService.origem;

  protected readonly ordemAtual = computed<Ordenacao>(() => {
    const ordem = this.ordem();
    return OPCOES_ORDENACAO.some((o) => o.valor === ordem) ? (ordem as Ordenacao) : 'relevancia';
  });
  protected readonly apenasPromo = computed(() => this.promo() === '1');
  protected readonly temFiltro = computed(() => !!(this.busca() || this.categoria() || this.apenasPromo()));
  protected readonly tituloCategoria = computed(() => {
    const categoria = this.categoria();
    return categoria ? rotuloCategoria(categoria) : 'Todos os produtos';
  });

  /** Lista final: recalculada sozinha quando os produtos ou qualquer filtro da URL mudam. */
  protected readonly resultado = computed(() =>
    filtrarProdutos(this.produtos(), {
      busca: this.busca(),
      categoria: this.categoria(),
      apenasPromo: this.apenasPromo(),
      ordem: this.ordemAtual(),
    }),
  );

  /**
   * Ids dos 4 primeiros cards ao abrir a página: as fotos deles carregam com prioridade (LCP).
   * Fica fixo depois, porque o NgOptimizedImage não deixa mudar `priority` de uma imagem já criada.
   */
  protected idsPrioritarios = new Set<number>();

  /** RxJS para o que acontece no tempo: espera a pessoa parar de digitar antes de mexer na URL. */
  private readonly termoDigitado = new Subject<string>();

  constructor() {
    this.carregar();

    this.termoDigitado
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((termo) => this.atualizarUrl({ busca: termo.trim() || null }, true));
  }

  carregar(): void {
    this.estado.set('carregando');
    this.produtoService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.produtos.set(lista);
          this.idsPrioritarios = new Set(this.resultado().slice(0, 4).map((p) => p.id));
          this.estado.set('pronto');
        },
        error: () => this.estado.set('erro'),
      });
  }

  aoDigitar(termo: string): void {
    this.termoDigitado.next(termo);
  }

  alterarOrdem(ordem: string): void {
    this.atualizarUrl({ ordem: ordem === 'relevancia' ? null : ordem });
  }

  alternarPromo(): void {
    this.atualizarUrl({ promo: this.apenasPromo() ? null : 1 });
  }

  onAdicionar(produto: Produto): void {
    this.carrinho.adicionar(produto);
    this.toast.mostrar('Produto adicionado ao carrinho', { rotulo: 'Ver carrinho', rota: '/carrinho' });
  }

  private atualizarUrl(params: Params, substituirHistorico = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: substituirHistorico,
    });
  }
}
