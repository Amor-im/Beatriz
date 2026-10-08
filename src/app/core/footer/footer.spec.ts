import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  it('avisa que a loja é uma demonstração', () => {
    TestBed.configureTestingModule({ imports: [Footer], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma compra é real');
  });
});
