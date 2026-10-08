import { Produto, ProdutoApi } from '../app/model/produto';

/** Produtos de teste, no formato que a Fake Store API devolve. */
export const PRODUTOS_API: ProdutoApi[] = [
  {
    id: 1,
    title: 'Fjallraven - Foldsack No. 1 Backpack ',
    price: 109.95,
    description: 'Your perfect pack for everyday use.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/1.jpg',
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 5,
    title: 'John Hardy Bracelet',
    price: 695,
    description: 'From our Legends Collection.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/5.jpg',
    rating: { rate: 4.6, count: 400 },
  },
  {
    id: 7,
    title: 'White Gold Plated Princess',
    price: 9.99,
    description: 'Classic Created Wedding Engagement Ring.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/7.jpg',
  },
  {
    id: 10,
    title: 'SanDisk SSD PLUS 1TB',
    price: 109,
    description: 'Easy upgrade for faster boot up.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/10.jpg',
  },
];

export function produtoFake(sobrescrever: Partial<Produto> = {}): Produto {
  return {
    id: 1,
    nome: 'Mochila',
    preco: 100,
    descricao: 'Uma mochila de teste.',
    categoria: 'moda-masculina',
    imageUrl: 'images/produtos/1.webp',
    ...sobrescrever,
  };
}
