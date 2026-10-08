import { Routes } from '@angular/router';
import { carrinhoComItensGuard } from './features/carrinho/carrinho-com-itens.guard';

// Cada página é carregada sob demanda (lazy loading): o código do checkout,
// por exemplo, só é baixado quando a pessoa chega no checkout.
export const routes: Routes = [
  {
    path: '',
    title: 'Moda, joias e eletrônicos',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'produtos',
    title: 'Produtos',
    loadComponent: () =>
      import('./features/produtos/lista-produtos/lista-produtos').then((m) => m.ListaProdutos),
  },
  {
    path: 'produtos/novo',
    title: 'Cadastrar produto',
    loadComponent: () =>
      import('./features/produtos/produto-form/produto-form').then((m) => m.ProdutoForm),
  },
  {
    path: 'produtos/:id',
    // O componente troca este título pelo nome do produto quando ele carrega.
    title: 'Produto',
    loadComponent: () =>
      import('./features/produtos/produto-detalhe/produto-detalhe').then((m) => m.ProdutoDetalhe),
  },
  {
    path: 'carrinho',
    title: 'Carrinho',
    loadComponent: () =>
      import('./features/carrinho/pagina-carrinho/pagina-carrinho').then((m) => m.PaginaCarrinho),
  },
  {
    path: 'checkout',
    title: 'Finalizar compra',
    canActivate: [carrinhoComItensGuard],
    loadComponent: () => import('./features/carrinho/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'pedido-confirmado',
    title: 'Pedido confirmado',
    loadComponent: () =>
      import('./features/carrinho/pedido-confirmado/pedido-confirmado').then(
        (m) => m.PedidoConfirmado,
      ),
  },
  {
    path: 'sobre',
    title: 'Sobre o projeto',
    loadComponent: () => import('./features/sobre/sobre').then((m) => m.Sobre),
  },
  {
    path: '**',
    title: 'Página não encontrada',
    loadComponent: () =>
      import('./features/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
