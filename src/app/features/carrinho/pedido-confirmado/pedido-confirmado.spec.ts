import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { produtoFake } from '../../../../testing/produtos-fake';
import { CarrinhoService } from '../carrinho.service';
import { ATRASO_SIMULADO_MS, PedidoService } from '../pedido.service';
import { PedidoConfirmado } from './pedido-confirmado';

describe('PedidoConfirmado', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [PedidoConfirmado], providers: [provideRouter([])] });
  });

  it('sem pedido recente, explica e oferece o catálogo', () => {
    const fixture = TestBed.createComponent(PedidoConfirmado);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum pedido recente');
  });

  it('mostra o número do pedido e o primeiro nome', fakeAsync(() => {
    TestBed.inject(CarrinhoService).adicionar(produtoFake(), 1);
    TestBed.inject(PedidoService)
      .finalizar({
        nome: 'Ana Souza',
        email: 'ana@exemplo.com',
        cep: '01310-100',
        endereco: 'Avenida Paulista',
        numero: '1000',
        complemento: '',
        cidade: 'São Paulo',
        uf: 'SP',
        pagamento: 'pix',
      })
      .subscribe();
    tick(ATRASO_SIMULADO_MS);

    const fixture = TestBed.createComponent(PedidoConfirmado);
    fixture.detectChanges();
    const texto: string = fixture.nativeElement.textContent;

    expect(texto).toContain('Pedido confirmado, Ana!');
    expect(texto).toMatch(/Pedido VT-[A-Z0-9]+/);
  }));
});
