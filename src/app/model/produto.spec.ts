import { PRODUTOS_API } from '../../testing/produtos-fake';
import { aplicarDesconto, precoFinal, ProdutoMapper, rotuloCategoria } from './produto';

describe('model/produto', () => {
  describe('ProdutoMapper.fromApi', () => {
    it('traduz a categoria da API para um slug em PT-BR', () => {
      expect(ProdutoMapper.fromApi(PRODUTOS_API[3]).categoria).toBe('eletronicos');
    });

    it('marca estoque e promoção sempre do mesmo jeito para o mesmo id', () => {
      const primeira = PRODUTOS_API.map((p) => ProdutoMapper.fromApi(p));
      const segunda = PRODUTOS_API.map((p) => ProdutoMapper.fromApi(p));

      expect(primeira).toEqual(segunda);
      expect(primeira.find((p) => p.id === 7)?.estado).toBe('esgotado');
      expect(primeira.find((p) => p.id === 5)?.promo).toBeTrue();
      expect(primeira.find((p) => p.id === 1)?.promo).toBeFalse();
    });

    it('mantém a categoria original quando ela não é conhecida', () => {
      const produto = ProdutoMapper.fromApi({ ...PRODUTOS_API[0], category: 'livros' });

      expect(produto.categoria).toBe('livros');
      expect(rotuloCategoria(produto.categoria)).toBe('livros');
    });
  });

  it('ProdutoMapper.toApi volta para os nomes de campo da API', () => {
    const api = ProdutoMapper.toApi(ProdutoMapper.fromApi(PRODUTOS_API[1]));

    expect(api.category).toBe('jewelery');
    expect(api.title).toBe('John Hardy Bracelet');
  });

  it('precoFinal aplica o desconto só em promoção', () => {
    expect(precoFinal({ preco: 200, promo: true })).toBe(180);
    expect(precoFinal({ preco: 200 })).toBe(200);
    expect(aplicarDesconto(9.99, 10)).toBe(8.99);
  });
});
