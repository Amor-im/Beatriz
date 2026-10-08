import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProdutoForm } from './produto-form';

describe('ProdutoForm', () => {
  let fixture: ComponentFixture<ProdutoForm>;
  let http: HttpTestingController;
  let el: HTMLElement;

  function digitar(seletor: string, valor: string): void {
    const campo = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(seletor)!;
    campo.value = valor;
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input'));
    campo.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  const enviar = () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProdutoForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProdutoForm);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('não envia o formulário vazio e mostra as mensagens de erro', () => {
    enviar();

    const erros = Array.from(el.querySelectorAll('.campo__erro')).map((e) => e.textContent?.trim());
    expect(erros).toContain('Digite o nome do produto.');
    expect(erros).toContain('Escolha uma categoria.');
    expect(el.querySelector('#nome')?.getAttribute('aria-invalid')).toBe('true');
    http.expectNone(`${environment.apiUrl}/products`);
  });

  it('atualiza a prévia do card enquanto a pessoa digita', () => {
    digitar('#nome', 'Caneca de cerâmica');

    expect(el.querySelector('.cadastro__previa')?.textContent).toContain('Caneca de cerâmica');
  });

  it('exige o nome da nova categoria só quando escolhe "Outra"', () => {
    digitar('#categoria', 'outra');
    expect(el.querySelector('#novaCategoria')).not.toBeNull();

    enviar();
    expect(el.textContent).toContain('Digite o nome da categoria');
  });

  it('envia para a API e mostra a confirmação', () => {
    digitar('#nome', 'Caneca de cerâmica');
    digitar('#preco', '39.9');
    digitar('#categoria', 'joias');
    digitar('#descricao', 'Caneca de 300 ml, pode ir ao micro-ondas.');
    enviar();

    expect(el.querySelector('button[type="submit"]')?.textContent).toContain('Salvando');
    const req = http.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.body.title).toBe('Caneca de cerâmica');
    req.flush({ id: 21, ...req.request.body });
    fixture.detectChanges();

    expect(el.querySelector('.aviso--sucesso')?.textContent).toContain('id 21');
  });

  it('mantém os dados e mostra erro quando a API falha', () => {
    digitar('#nome', 'Caneca de cerâmica');
    digitar('#preco', '39.9');
    digitar('#categoria', 'joias');
    digitar('#descricao', 'Caneca de 300 ml, pode ir ao micro-ondas.');
    enviar();

    http.expectOne(`${environment.apiUrl}/products`).error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível cadastrar agora');
    expect(el.querySelector<HTMLInputElement>('#nome')!.value).toBe('Caneca de cerâmica');
  });
});
