/** Formato de um produto como a Fake Store API devolve (e como está no `produtos.json` local). */
export interface ProdutoApi {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

/** Corpo enviado no POST de cadastro: é o produto da API sem `id` e sem `rating`. */
export type NovoProdutoApi = Omit<ProdutoApi, 'id' | 'rating'>;

export type EstadoProduto = 'novo' | 'esgotado';

/** Produto como a loja usa internamente (nomes em português). */
export interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imageUrl?: string;
  promo?: boolean;
  estado?: EstadoProduto;
  /** Slug da categoria (ex.: `joias`). O rótulo em PT-BR vem de `rotuloCategoria`. */
  categoria: string;
  avaliacao?: { nota: number; total: number };
}

/** Percentual de desconto aplicado aos produtos em promoção. */
export const DESCONTO_PROMO = 10;

export interface Categoria {
  slug: string;
  rotulo: string;
  /** Nome da categoria na Fake Store API. */
  api: string;
}

export const CATEGORIAS: readonly Categoria[] = [
  { slug: 'moda-feminina', rotulo: 'Moda feminina', api: "women's clothing" },
  { slug: 'moda-masculina', rotulo: 'Moda masculina', api: "men's clothing" },
  { slug: 'joias', rotulo: 'Joias', api: 'jewelery' },
  { slug: 'eletronicos', rotulo: 'Eletrônicos', api: 'electronics' },
];

/** Devolve o rótulo em PT-BR de uma categoria; se ela não for conhecida, devolve o próprio valor. */
export function rotuloCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.rotulo ?? slug;
}

/** Aplica um desconto percentual e arredonda para centavos. */
export function aplicarDesconto(valor: number, percentual: number): number {
  const percentualValido = Math.min(Math.max(percentual, 0), 100);
  return Math.round(valor * (1 - percentualValido / 100) * 100) / 100;
}

/** Preço que o cliente paga: com desconto se o produto estiver em promoção. */
export function precoFinal(produto: Pick<Produto, 'preco' | 'promo'>): number {
  return produto.promo ? aplicarDesconto(produto.preco, DESCONTO_PROMO) : produto.preco;
}

export class ProdutoMapper {
  static fromApi(json: ProdutoApi): Produto {
    const categoria = CATEGORIAS.find((c) => c.api === json.category);
    // A Fake Store API não informa estoque nem promoção. Para a demonstração,
    // uso regras fixas a partir do id: assim o mesmo produto aparece sempre igual.
    const estado: EstadoProduto | undefined =
      json.id % 7 === 0 ? 'esgotado' : json.id >= 17 ? 'novo' : undefined;

    return {
      id: json.id,
      nome: json.title.trim(),
      preco: json.price,
      descricao: json.description,
      imageUrl: json.image,
      promo: json.id % 5 === 0 && estado !== 'esgotado',
      estado,
      categoria: categoria?.slug ?? json.category,
      avaliacao: json.rating ? { nota: json.rating.rate, total: json.rating.count } : undefined,
    };
  }

  static toApi(produto: Produto): NovoProdutoApi {
    const categoria = CATEGORIAS.find((c) => c.slug === produto.categoria);
    return {
      title: produto.nome,
      price: produto.preco,
      description: produto.descricao,
      image: produto.imageUrl ?? '',
      category: categoria?.api ?? produto.categoria,
    };
  }
}
