import { produtoFake } from '../../../testing/produtos-fake';
import { filtrarProdutos, normalizarTexto } from './filtro-produtos';

describe('filtrarProdutos', () => {
  const produtos = [
    produtoFake({ id: 1, nome: 'Backpack', preco: 109.95, categoria: 'moda-masculina' }),
    produtoFake({ id: 2, nome: 'Bracelet', preco: 695, categoria: 'joias', promo: true }),
    produtoFake({ id: 3, nome: 'SSD 1TB', preco: 109, categoria: 'eletronicos' }),
    produtoFake({ id: 4, nome: 'Anel', preco: 9.99, categoria: 'joias' }),
  ];
  const ids = (lista: { id: number }[]) => lista.map((p) => p.id);

  it('sem filtro devolve tudo na ordem original', () => {
    expect(ids(filtrarProdutos(produtos, {}))).toEqual([1, 2, 3, 4]);
  });

  it('filtra por categoria', () => {
    expect(ids(filtrarProdutos(produtos, { categoria: 'joias' }))).toEqual([2, 4]);
  });

  it('busca ignorando maiúsculas e acentos, inclusive no nome da categoria', () => {
    expect(ids(filtrarProdutos(produtos, { busca: 'ssd' }))).toEqual([3]);
    expect(ids(filtrarProdutos(produtos, { busca: 'ELETRONICOS' }))).toEqual([3]);
  });

  it('mostra só promoções', () => {
    expect(ids(filtrarProdutos(produtos, { apenasPromo: true }))).toEqual([2]);
  });

  it('ordena pelo preço final (com desconto)', () => {
    expect(ids(filtrarProdutos(produtos, { ordem: 'menor-preco' }))).toEqual([4, 3, 1, 2]);
    expect(ids(filtrarProdutos(produtos, { ordem: 'maior-preco' }))).toEqual([2, 1, 3, 4]);
  });

  it('ordena por nome', () => {
    expect(ids(filtrarProdutos(produtos, { ordem: 'nome' }))).toEqual([4, 1, 2, 3]);
  });

  it('não altera a lista original', () => {
    filtrarProdutos(produtos, { ordem: 'nome' });
    expect(ids(produtos)).toEqual([1, 2, 3, 4]);
  });

  it('normalizarTexto remove acentos e espaços das pontas', () => {
    expect(normalizarTexto('  Eletrônicos ')).toBe('eletronicos');
  });
});
