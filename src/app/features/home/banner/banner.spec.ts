import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { produtoFake } from '../../../../testing/produtos-fake';
import { Banner } from './banner';

describe('Banner', () => {
  let fixture: ComponentFixture<Banner>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Banner], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Banner);
  });

  it('tem o título principal da página e o botão para o catálogo', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent).toContain('numa vitrine só');
    expect(el.querySelector('a[href="/produtos"]')?.textContent).toContain('Ver produtos');
  });

  it('mostra espaços vazios enquanto carrega e os destaques depois', () => {
    fixture.componentRef.setInput('carregando', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.vitrine__foto.esqueleto').length).toBe(3);

    fixture.componentRef.setInput('carregando', false);
    fixture.componentRef.setInput('destaques', [produtoFake({ id: 1 }), produtoFake({ id: 2 })]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('a.vitrine__item').length).toBe(2);
  });
});
