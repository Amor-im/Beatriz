import { precoFinal, Produto, rotuloCategoria } from '../../model/produto';

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

export const OPCOES_ORDENACAO: readonly { valor: Ordenacao; rotulo: string }[] = [
  { valor: 'relevancia', rotulo: 'Relevância' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
  { valor: 'nome', rotulo: 'Nome (A–Z)' },
];

export interface FiltroProdutos {
  busca?: string;
  categoria?: string;
  apenasPromo?: boolean;
  ordem?: Ordenacao;
}

/** Remove acentos e caixa para a busca achar "eletronico" em "Eletrônico". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** A busca olha nome, descrição e categoria em PT-BR (os nomes da API estão em inglês). */
function textoPesquisavel(p: Produto): string {
  return `${p.nome} ${p.descricao} ${rotuloCategoria(p.categoria)}`;
}

/** Função pura: recebe a lista e o filtro, devolve uma nova lista. Fácil de testar. */
export function filtrarProdutos(produtos: readonly Produto[], filtro: FiltroProdutos): Produto[] {
  const termo = normalizarTexto(filtro.busca ?? '');

  const filtrados = produtos.filter(
    (p) =>
      (!filtro.categoria || p.categoria === filtro.categoria) &&
      (!filtro.apenasPromo || p.promo) &&
      (!termo || normalizarTexto(textoPesquisavel(p)).includes(termo)),
  );

  switch (filtro.ordem) {
    case 'menor-preco':
      return filtrados.sort((a, b) => precoFinal(a) - precoFinal(b));
    case 'maior-preco':
      return filtrados.sort((a, b) => precoFinal(b) - precoFinal(a));
    case 'nome':
      return filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    default:
      return filtrados;
  }
}
