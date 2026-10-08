import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaleriaProduto } from './galeria-produto';

describe('GaleriaProduto', () => {
  let fixture: ComponentFixture<GaleriaProduto>;
  let el: HTMLElement;

  function montar(imagens: string[]): void {
    fixture.componentRef.setInput('imagens', imagens);
    fixture.componentRef.setInput('nome', 'Mochila');
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(GaleriaProduto);
    el = fixture.nativeElement;
  });

  it('amplia e reduz a foto ao clicar', () => {
    montar(['images/produtos/1.webp']);
    const botao = el.querySelector<HTMLButtonElement>('.galeria__principal')!;
    expect(botao.getAttribute('aria-pressed')).toBe('false');

    botao.click();
    fixture.detectChanges();
    expect(botao.getAttribute('aria-pressed')).toBe('true');
    expect(botao.getAttribute('aria-label')).toBe('Reduzir foto');
  });

  it('só mostra miniaturas quando há mais de uma foto', () => {
    montar(['images/produtos/1.webp']);
    expect(el.querySelector('.galeria__miniaturas')).toBeNull();

    montar(['images/produtos/1.webp', 'images/produtos/2.webp']);
    const miniaturas = el.querySelectorAll<HTMLButtonElement>('.miniatura');
    expect(miniaturas.length).toBe(2);

    miniaturas[1].click();
    fixture.detectChanges();
    expect(miniaturas[1].getAttribute('aria-current')).toBe('true');
  });

  it('usa o nome do produto no texto alternativo', () => {
    montar(['images/produtos/1.webp']);

    expect(el.querySelector('.galeria__principal img')?.getAttribute('alt')).toBe('Foto do produto: Mochila');
  });
});
