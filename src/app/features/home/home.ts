import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast/toast.service';
import { CATEGORIAS, Produto } from '../../model/produto';
import { CarrinhoService, mensagemAdicao } from '../carrinho/carrinho.service';
import { CardProduto } from '../produtos/card-produto/card-produto';
import { ProdutoService } from '../produtos/produto.service';
import { Banner } from './banner/banner';

/** Produtos que aparecem na vitrine do topo. */
const IDS_DESTAQUE = [1, 5, 15];

/** Foto usada em cada atalho de categoria (arquivos locais em public/images/produtos). */
const FOTO_CATEGORIA: Record<string, string> = {
  'moda-feminina': 'images/produtos/17.webp',
  'moda-masculina': 'images/produtos/3.webp',
  joias: 'images/produtos/6.webp',
  eletronicos: 'images/produtos/13.webp',
};

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Banner, CardProduto, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);

  protected readonly carregando = signal(true);
  private readonly produtos = signal<Produto[]>([]);

  protected readonly categorias = CATEGORIAS.map((c) => ({ ...c, foto: FOTO_CATEGORIA[c.slug] }));
  protected readonly destaques = computed(() =>
    IDS_DESTAQUE.map((id) => this.produtos().find((p) => p.id === id)).filter(
      (p): p is Produto => !!p,
    ),
  );
  protected readonly promocoes = computed(() => this.produtos().filter((p) => p.promo));

  constructor() {
    this.produtoService
      .listar()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (lista) => {
          this.produtos.set(lista);
          this.carregando.set(false);
        },
        // Na home, se tudo falhar, as seções de produto somem e os links para o catálogo continuam.
        error: () => this.carregando.set(false),
      });
  }

  onAdicionar(produto: Produto): void {
    const adicionadas = this.carrinho.adicionar(produto);
    this.toast.mostrar(
      mensagemAdicao(adicionadas),
      { rotulo: 'Ver carrinho', rota: '/carrinho' },
      adicionadas > 0 ? 'sucesso' : 'aviso',
    );
  }
}
