import { TestBed } from '@angular/core/testing';
import { produtoFake } from '../../../testing/produtos-fake';
import { CarrinhoService, CHAVE_CARRINHO, mensagemAdicao, QUANTIDADE_MAXIMA } from './carrinho.service';
import { VALOR_FRETE } from './frete';

describe('CarrinhoService', () => {
  let carrinho: CarrinhoService;

  const mochila = produtoFake({ id: 1, preco: 100 });
  const pulseira = produtoFake({ id: 5, nome: 'Pulseira', preco: 200, promo: true });

  function criarServico(): CarrinhoService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(CarrinhoService);
  }

  beforeEach(() => {
    localStorage.clear();
    carrinho = criarServico();
  });

  afterEach(() => localStorage.clear());

  it('começa vazio', () => {
    expect(carrinho.vazio()).toBeTrue();
    expect(carrinho.quantidadeTotal()).toBe(0);
    expect(carrinho.total()).toBe(0);
  });

  describe('adicionar', () => {
    it('inclui um produto novo com a quantidade pedida', () => {
      carrinho.adicionar(mochila, 2);

      expect(carrinho.itens().length).toBe(1);
      expect(carrinho.itens()[0].quantidade).toBe(2);
      expect(carrinho.quantidadeTotal()).toBe(2);
    });

    it('soma a quantidade quando o produto já está no carrinho', () => {
      carrinho.adicionar(mochila);
      carrinho.adicionar(mochila, 3);

      expect(carrinho.itens().length).toBe(1);
      expect(carrinho.itens()[0].quantidade).toBe(4);
    });

    it(`não passa de ${QUANTIDADE_MAXIMA} unidades e devolve quantas entraram de fato`, () => {
      expect(carrinho.adicionar(mochila, 8)).toBe(8);
      expect(carrinho.adicionar(mochila, 5)).toBe(2);
      expect(carrinho.adicionar(mochila, 1)).toBe(0);

      expect(carrinho.itens()[0].quantidade).toBe(QUANTIDADE_MAXIMA);
    });

    it('ignora produto esgotado e quantidade zero', () => {
      carrinho.adicionar(produtoFake({ id: 7, estado: 'esgotado' }));
      carrinho.adicionar(mochila, 0);

      expect(carrinho.vazio()).toBeTrue();
    });
  });

  describe('remover e alterar quantidade', () => {
    beforeEach(() => {
      carrinho.adicionar(mochila, 2);
      carrinho.adicionar(pulseira, 1);
    });

    it('remove só o produto escolhido', () => {
      carrinho.remover(mochila.id);

      expect(carrinho.itens().map((i) => i.produto.id)).toEqual([pulseira.id]);
    });

    it('altera a quantidade de um item', () => {
      carrinho.alterarQuantidade(mochila.id, 5);

      expect(carrinho.itens().find((i) => i.produto.id === mochila.id)?.quantidade).toBe(5);
    });

    it('remove o item quando a quantidade vai para zero', () => {
      carrinho.alterarQuantidade(mochila.id, 0);

      expect(carrinho.itens().length).toBe(1);
    });

    it('limpa tudo', () => {
      carrinho.limpar();

      expect(carrinho.vazio()).toBeTrue();
    });
  });

  describe('totais (computed)', () => {
    it('calcula o subtotal com o desconto da promoção e cobra frete abaixo de R$ 299', () => {
      carrinho.adicionar(mochila, 1); // 100,00
      carrinho.adicionar(pulseira, 1); // 200,00 com 10% de desconto = 180,00

      expect(carrinho.subtotal()).toBe(280);
      expect(carrinho.frete()).toBe(VALOR_FRETE);
      expect(carrinho.total()).toBe(280 + VALOR_FRETE);
      expect(carrinho.faltaParaFreteGratis()).toBe(19);
    });

    it('dá frete grátis a partir de R$ 299', () => {
      carrinho.adicionar(mochila, 3); // 300,00

      expect(carrinho.frete()).toBe(0);
      expect(carrinho.total()).toBe(300);
      expect(carrinho.faltaParaFreteGratis()).toBe(0);
    });

    it('recalcula sozinho quando a lista muda', () => {
      carrinho.adicionar(mochila, 1);
      expect(carrinho.subtotal()).toBe(100);

      carrinho.alterarQuantidade(mochila.id, 2);
      expect(carrinho.subtotal()).toBe(200);
    });
  });

  describe('localStorage', () => {
    it('salva o carrinho quando a lista muda (effect)', () => {
      carrinho.adicionar(mochila, 2);
      TestBed.tick(); // roda os effects pendentes

      const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) ?? '[]');
      expect(salvo.length).toBe(1);
      expect(salvo[0].quantidade).toBe(2);
    });

    it('recupera o carrinho salvo ao iniciar', () => {
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify([{ produto: mochila, quantidade: 3 }]));

      const novo = criarServico();

      expect(novo.quantidadeTotal()).toBe(3);
    });

    it('começa vazio se o conteúdo salvo estiver corrompido', () => {
      localStorage.setItem(CHAVE_CARRINHO, '{isso não é json');

      expect(criarServico().vazio()).toBeTrue();
    });

    it('descarta itens salvos com formato inválido', () => {
      localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify([
          { produto: mochila, quantidade: 1 },
          { produto: null, quantidade: 2 },
          { produto: pulseira, quantidade: 999 }, // editado na mão: passa do limite
          { produto: { ...mochila, id: 9 }, quantidade: 1.5 },
        ]),
      );

      expect(criarServico().itens().length).toBe(1);
    });
  });

  it('mensagemAdicao explica quando o limite já foi atingido', () => {
    expect(mensagemAdicao(1)).toBe('1 unidade adicionada ao carrinho');
    expect(mensagemAdicao(3)).toBe('3 unidades adicionadas ao carrinho');
    expect(mensagemAdicao(0)).toContain(`máximo de ${QUANTIDADE_MAXIMA} unidades`);
  });
});
