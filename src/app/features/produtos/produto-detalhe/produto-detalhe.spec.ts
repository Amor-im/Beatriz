import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PRODUTOS_API } from '../../../../testing/produtos-fake';
import { CarrinhoService } from '../../carrinho/carrinho.service';
import { ProdutoDetalhe } from './produto-detalhe';

describe('ProdutoDetalhe', () => {
  let fixture: ComponentFixture<ProdutoDetalhe>;
  let http: HttpTestingController;
  let el: HTMLElement;
  const URL_API = `${environment.apiUrl}/products`;

  function abrir(id: string): void {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    spyOn(console, 'info');
    spyOn(console, 'warn');
    TestBed.configureTestingModule({
      imports: [ProdutoDetalhe],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProdutoDetalhe);
    el = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('busca o produto do :id e mostra nome, categoria e título da aba', () => {
    abrir('5');
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Carregando produto');

    http.expectOne(`${URL_API}/5`).flush(PRODUTOS_API[1]);
    fixture.detectChanges();

    expect(el.querySelector('h1')?.textContent).toContain('John Hardy Bracelet');
    expect(el.textContent).toContain('Joias');
    expect(TestBed.inject(Title).getTitle()).toBe('John Hardy Bracelet | Vitrine');
  });

  it('adiciona ao carrinho a quantidade escolhida', () => {
    abrir('1');
    http.expectOne(`${URL_API}/1`).flush(PRODUTOS_API[0]);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('button[aria-label^="Aumentar"]')!.click();
    el.querySelector<HTMLButtonElement>('.produto__botao')!.click();

    const carrinho = TestBed.inject(CarrinhoService);
    expect(carrinho.itens()[0].produto.id).toBe(1);
    expect(carrinho.itens()[0].quantidade).toBe(2);
  });

  it('não mostra o botão de compra para produto esgotado', () => {
    abrir('7');
    http.expectOne(`${URL_API}/7`).flush(PRODUTOS_API[2]);
    fixture.detectChanges();

    expect(el.querySelector('.produto__botao')).toBeNull();
    expect(el.textContent).toContain('Produto esgotado');
  });

  it('mostra "Produto não encontrado" para id inexistente', () => {
    abrir('999');
    http.expectOne(`${URL_API}/999`).flush(null);
    fixture.detectChanges();

    expect(el.querySelector('h1')?.textContent).toContain('Produto não encontrado');
  });

  it('nem chama a API quando o id não é um número', () => {
    abrir('abc');

    http.expectNone(() => true);
    expect(el.querySelector('h1')?.textContent).toContain('Produto não encontrado');
  });
});
