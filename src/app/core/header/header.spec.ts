import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { produtoFake } from '../../../testing/produtos-fake';
import { CarrinhoService } from '../../features/carrinho/carrinho.service';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('não mostra badge com o carrinho vazio', () => {
    expect(el.querySelector('.carrinho__badge')).toBeNull();
    expect(el.querySelector('.carrinho')?.getAttribute('aria-label')).toBe('Carrinho, vazio');
  });

  it('mostra a quantidade de itens no badge do carrinho', () => {
    TestBed.inject(CarrinhoService).adicionar(produtoFake(), 3);
    fixture.detectChanges();

    expect(el.querySelector('.carrinho__badge')?.textContent?.trim()).toBe('3');
    expect(el.querySelector('.carrinho')?.getAttribute('aria-label')).toBe('Carrinho, 3 itens');
  });
});
