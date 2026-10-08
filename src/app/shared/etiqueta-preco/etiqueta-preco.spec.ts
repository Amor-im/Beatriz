import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EtiquetaPreco } from './etiqueta-preco';

describe('EtiquetaPreco', () => {
  let fixture: ComponentFixture<EtiquetaPreco>;
  const texto = (seletor: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(seletor)?.textContent?.replace(/\s+/g, ' ').trim();

  beforeEach(() => {
    registerLocaleData(localePt);
    TestBed.configureTestingModule({
      imports: [EtiquetaPreco],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    });
    fixture = TestBed.createComponent(EtiquetaPreco);
  });

  it('mostra o preço em reais', () => {
    fixture.componentRef.setInput('preco', 1299.9);
    fixture.detectChanges();

    expect(texto('.etiqueta')).toBe('US$ 1.299,90');
    expect(texto('.antes')).toBeUndefined();
  });

  it('em promoção, risca o preço antigo e mostra o preço com desconto', () => {
    fixture.componentRef.setInput('preco', 109.95);
    fixture.componentRef.setInput('promo', true);
    fixture.detectChanges();

    expect(texto('s')).toBe('US$ 109,95');
    expect(texto('.etiqueta')).toBe('por US$ 98,96');
    expect(texto('.selo-desconto')).toBe('-10%');
  });
});
