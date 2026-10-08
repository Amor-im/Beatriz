import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DURACAO_TOAST_MS, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
  });

  it('mostra um aviso e some sozinho depois de alguns segundos', fakeAsync(() => {
    service.mostrar('Produto adicionado ao carrinho');
    expect(service.toasts().length).toBe(1);

    tick(DURACAO_TOAST_MS);
    expect(service.toasts().length).toBe(0);
  }));

  it('mantém no máximo 3 avisos na tela', fakeAsync(() => {
    ['a', 'b', 'c', 'd'].forEach((t) => service.mostrar(t));

    expect(service.toasts().map((t) => t.texto)).toEqual(['b', 'c', 'd']);
    tick(DURACAO_TOAST_MS);
  }));

  it('fecha um aviso pelo id', fakeAsync(() => {
    service.mostrar('a');
    service.fechar(service.toasts()[0].id);

    expect(service.toasts().length).toBe(0);
    tick(DURACAO_TOAST_MS);
  }));
});
