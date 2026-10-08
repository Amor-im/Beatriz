import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sobre } from './sobre';

describe('Sobre', () => {
  it('conta que o projeto começou na faculdade', () => {
    TestBed.configureTestingModule({ imports: [Sobre], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Sobre);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('IFSP');
  });
});
