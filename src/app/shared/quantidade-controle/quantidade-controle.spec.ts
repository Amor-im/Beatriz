import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuantidadeControle } from './quantidade-controle';

describe('QuantidadeControle', () => {
  let fixture: ComponentFixture<QuantidadeControle>;
  let component: QuantidadeControle;
  let botoes: HTMLButtonElement[];

  beforeEach(() => {
    fixture = TestBed.createComponent(QuantidadeControle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('max', 3);
    fixture.componentRef.setInput('rotulo', 'Mochila');
    fixture.detectChanges();
    botoes = Array.from(fixture.nativeElement.querySelectorAll('button'));
  });

  it('aumenta e diminui a quantidade', () => {
    botoes[1].click();
    botoes[1].click();
    expect(component.contador()).toBe(3);

    fixture.detectChanges(); // atualiza o [disabled] do botão "diminuir"
    botoes[0].click();
    expect(component.contador()).toBe(2);
  });

  it('respeita o mínimo e o máximo', () => {
    component.decrementar();
    expect(component.contador()).toBe(1);

    for (let i = 0; i < 10; i++) component.incrementar();
    expect(component.contador()).toBe(3);
  });

  it('desabilita "diminuir" no mínimo e usa o nome do produto no rótulo', () => {
    expect(botoes[0].disabled).toBeTrue();
    expect(botoes[1].getAttribute('aria-label')).toBe('Aumentar quantidade de Mochila');
  });
});
