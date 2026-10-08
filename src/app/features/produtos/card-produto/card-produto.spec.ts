import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Produto } from '../../../model/produto';
import { produtoFake } from '../../../../testing/produtos-fake';
import { CardProduto } from './card-produto';

describe('CardProduto', () => {
  let fixture: ComponentFixture<CardProduto>;
  let el: HTMLElement;

  function montar(produto: Produto, previa = false): void {
    fixture.componentRef.setInput('produto', produto);
    fixture.componentRef.setInput('previa', previa);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CardProduto], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(CardProduto);
    el = fixture.nativeElement;
  });

  it('mostra nome, categoria em PT-BR e link para o detalhe', () => {
    montar(produtoFake({ id: 3, nome: 'Mens Cotton Jacket', categoria: 'moda-masculina' }));

    const link = el.querySelector<HTMLAnchorElement>('.card__link')!;
    expect(link.textContent?.trim()).toBe('Mens Cotton Jacket');
    expect(link.getAttribute('href')).toBe('/produtos/3');
    expect(el.textContent).toContain('Moda masculina');
  });

  it('avisa o componente pai (output) ao clicar em "Adicionar"', () => {
    const produto = produtoFake();
    montar(produto);
    let emitido: Produto | undefined;
    fixture.componentInstance.adicionar.subscribe((p) => (emitido = p));

    el.querySelector<HTMLButtonElement>('.card__botao')!.click();

    expect(emitido).toBe(produto);
  });

  it('desabilita o botão de produto esgotado', () => {
    montar(produtoFake({ estado: 'esgotado' }));

    const botao = el.querySelector<HTMLButtonElement>('.card__botao')!;
    expect(botao.disabled).toBeTrue();
    expect(botao.textContent?.trim()).toBe('Esgotado');
  });

  it('mostra o selo de promoção', () => {
    montar(produtoFake({ promo: true }));

    expect(el.querySelector('.card__selo--promo')?.textContent).toContain('Promoção');
  });

  it('no modo prévia não tem link e o botão fica desabilitado', () => {
    montar(produtoFake({ nome: '' }), true);

    expect(el.querySelector('.card__link')).toBeNull();
    expect(el.textContent).toContain('Nome do produto');
    expect(el.querySelector<HTMLButtonElement>('.card__botao')!.disabled).toBeTrue();
  });
});
