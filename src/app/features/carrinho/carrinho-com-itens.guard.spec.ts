import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { produtoFake } from '../../../testing/produtos-fake';
import { carrinhoComItensGuard } from './carrinho-com-itens.guard';
import { CarrinhoService } from './carrinho.service';

describe('carrinhoComItensGuard', () => {
  const executar = () =>
    TestBed.runInInjectionContext(() => carrinhoComItensGuard({} as never, {} as never));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('manda para /carrinho quando o carrinho está vazio', () => {
    const resultado = executar() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/carrinho');
  });

  it('deixa entrar quando há itens', () => {
    TestBed.inject(CarrinhoService).adicionar(produtoFake());

    expect(executar()).toBeTrue();
  });
});
