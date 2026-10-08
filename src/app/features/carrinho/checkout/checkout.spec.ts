import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { produtoFake } from '../../../../testing/produtos-fake';
import { CarrinhoService } from '../carrinho.service';
import { ATRASO_SIMULADO_MS, PedidoService } from '../pedido.service';
import { Checkout } from './checkout';

describe('Checkout', () => {
  let fixture: ComponentFixture<Checkout>;
  let el: HTMLElement;

  function preencher(id: string, valor: string): void {
    const campo = el.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id)!;
    campo.value = valor;
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input'));
  }

  const confirmar = () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    spyOn(console, 'info');
    TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(CarrinhoService).adicionar(produtoFake({ preco: 100 }), 1);
    fixture = TestBed.createComponent(Checkout);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('não confirma com o formulário vazio e explica cada erro', () => {
    confirmar();

    expect(el.querySelector('#erro-nome')?.textContent).toContain('Digite seu nome completo');
    expect(el.querySelector('#erro-cep')?.textContent).toContain('Digite o CEP');
    expect(TestBed.inject(PedidoService).ultimoPedido()).toBeNull();
  });

  it('não aceita nome só com espaços ou só com uma palavra', () => {
    preencher('nome', '     ');
    confirmar();
    expect(el.querySelector('#erro-nome')?.textContent).toContain('Digite nome e sobrenome');

    preencher('nome', 'Beatriz');
    fixture.detectChanges();
    expect(el.querySelector('#erro-nome')?.textContent).toContain('Digite nome e sobrenome');
  });

  it('valida o formato do e-mail e do CEP', () => {
    preencher('email', 'ana.exemplo.com');
    preencher('cep', '0131');
    confirmar();

    expect(el.querySelector('#erro-email')?.textContent).toContain('precisa ter @');
    expect(el.querySelector('#erro-cep')?.textContent).toContain('00000-000');
  });

  it('com tudo certo, cria o pedido, esvazia o carrinho e vai para a confirmação', fakeAsync(() => {
    const navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    preencher('nome', 'Ana Souza');
    preencher('email', 'ana@exemplo.com');
    preencher('cep', '01310100');
    preencher('endereco', 'Avenida Paulista');
    preencher('numero', '1000');
    preencher('cidade', 'São Paulo');
    preencher('uf', 'SP');
    confirmar();

    expect(el.querySelector('button[type="submit"]')?.textContent).toContain('Confirmando pedido');
    confirmar(); // segundo clique enquanto confirma: ignorado
    tick(ATRASO_SIMULADO_MS);
    expect(navegar).toHaveBeenCalledTimes(1);

    const pedido = TestBed.inject(PedidoService).ultimoPedido();
    expect(pedido?.entrega.cep).toBe('01310-100');
    expect(pedido?.total).toBe(124.9);
    expect(TestBed.inject(CarrinhoService).vazio()).toBeTrue();
    expect(navegar).toHaveBeenCalledWith(['/pedido-confirmado']);
  }));
});
