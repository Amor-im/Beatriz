import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PRODUTOS_API, produtoFake } from '../../../../testing/produtos-fake';
import { CarrinhoService } from '../carrinho.service';
import { PaginaCarrinho } from './pagina-carrinho';

describe('PaginaCarrinho', () => {
  let fixture: ComponentFixture<PaginaCarrinho>;
  let carrinho: CarrinhoService;
  let el: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    spyOn(console, 'info');
    TestBed.configureTestingModule({
      imports: [PaginaCarrinho],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    carrinho = TestBed.inject(CarrinhoService);
    fixture = TestBed.createComponent(PaginaCarrinho);
    el = fixture.nativeElement;
  });

  it('mostra o estado vazio com link para os produtos', () => {
    fixture.detectChanges();

    expect(el.textContent).toContain('Seu carrinho está vazio');
    expect(el.querySelector('a[href="/produtos"]')).not.toBeNull();
  });

  it('lista os itens e mostra quanto falta para o frete grátis', () => {
    carrinho.adicionar(produtoFake({ id: 1, nome: 'Mochila', preco: 100 }), 2);
    fixture.detectChanges();

    expect(el.querySelectorAll('.item').length).toBe(1);
    expect(el.querySelector('.item__nome')?.textContent).toContain('Mochila');
    expect(el.querySelector('.frete')?.textContent).toContain('para o frete grátis');
    expect(el.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('66');
  });

  it('altera a quantidade pelo seletor e remove o item', () => {
    carrinho.adicionar(produtoFake({ id: 1 }), 1);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.item button[aria-label^="Aumentar"]')!.click();
    expect(carrinho.quantidadeTotal()).toBe(2);

    el.querySelector<HTMLButtonElement>('.item__remover')!.click();
    fixture.detectChanges();
    expect(carrinho.vazio()).toBeTrue();
    expect(el.textContent).toContain('Seu carrinho está vazio');
  });

  it('atualiza o preço salvo com o catálogo atual ao abrir', () => {
    // Salvo com preço antigo; no catálogo da API o produto 1 custa 109,95.
    carrinho.adicionar(produtoFake({ id: 1, preco: 50 }), 1);
    fixture.detectChanges();

    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/products`)
      .flush(PRODUTOS_API);
    fixture.detectChanges();

    expect(carrinho.subtotal()).toBe(109.95);
  });
});

