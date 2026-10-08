import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PRODUTOS_API } from '../../../../testing/produtos-fake';
import { CarrinhoService } from '../../carrinho/carrinho.service';
import { ListaProdutos } from './lista-produtos';

describe('ListaProdutos', () => {
  let fixture: ComponentFixture<ListaProdutos>;
  let http: HttpTestingController;
  let el: HTMLElement;
  const URL_API = `${environment.apiUrl}/products`;

  const nomesNaTela = () =>
    Array.from(el.querySelectorAll('.card__link')).map((a) => a.textContent?.trim());

  beforeEach(() => {
    localStorage.clear();
    spyOn(console, 'info');
    spyOn(console, 'warn');
    TestBed.configureTestingModule({
      imports: [ListaProdutos],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ListaProdutos);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('mostra o esqueleto enquanto carrega e depois os produtos', () => {
    expect(el.querySelectorAll('.esqueleto-card').length).toBeGreaterThan(0);

    http.expectOne(URL_API).flush(PRODUTOS_API);
    fixture.detectChanges();

    expect(el.querySelectorAll('app-card-produto').length).toBe(4);
    expect(el.querySelector('.catalogo__contagem')?.textContent).toContain('4 produtos encontrados');
  });

  it('filtra pela categoria que vem da URL (?categoria=joias)', () => {
    fixture.componentRef.setInput('categoria', 'joias');
    http.expectOne(URL_API).flush(PRODUTOS_API);
    fixture.detectChanges();

    expect(nomesNaTela()).toEqual(['John Hardy Bracelet', 'White Gold Plated Princess']);
    expect(el.querySelector('h1')?.textContent).toContain('Joias');
  });

  it('mostra o estado vazio quando nenhum produto combina com a busca', () => {
    fixture.componentRef.setInput('busca', 'geladeira');
    http.expectOne(URL_API).flush(PRODUTOS_API);
    fixture.detectChanges();

    expect(el.querySelector('app-estado-vazio')?.textContent).toContain('Nenhum produto com esses filtros');
  });

  it('avisa quando está usando a cópia local do catálogo', () => {
    http.expectOne(URL_API).error(new ProgressEvent('network error'));
    http.expectOne(environment.catalogoLocalUrl).flush(PRODUTOS_API);
    fixture.detectChanges();

    expect(el.textContent).toContain('cópia local do catálogo');
  });

  it('mostra erro com "Tentar de novo" quando nada responde, e recarrega ao clicar', () => {
    http.expectOne(URL_API).error(new ProgressEvent('network error'));
    http.expectOne(environment.catalogoLocalUrl).error(new ProgressEvent('network error'));
    fixture.detectChanges();

    const alerta = el.querySelector('[role="alert"]');
    expect(alerta?.textContent).toContain('Não foi possível carregar os produtos');

    alerta!.querySelector('button')!.click();
    http.expectOne(URL_API).flush(PRODUTOS_API);
    fixture.detectChanges();
    expect(el.querySelectorAll('app-card-produto').length).toBe(4);
  });

  it('adiciona ao carrinho quando o card avisa', () => {
    http.expectOne(URL_API).flush(PRODUTOS_API);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.card__botao')!.click();

    expect(TestBed.inject(CarrinhoService).quantidadeTotal()).toBe(1);
  });
});
