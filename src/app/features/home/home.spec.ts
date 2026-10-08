import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PRODUTOS_API } from '../../../testing/produtos-fake';
import { Home } from './home';

describe('Home', () => {
  it('mostra as categorias e os produtos em promoção', () => {
    spyOn(console, 'info');
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/products`).flush(PRODUTOS_API);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('.categoria').length).toBe(4);
    // Nos dados de teste, os produtos 5 e 10 estão em promoção (id múltiplo de 5).
    expect(el.querySelectorAll('section[aria-labelledby="titulo-promocoes"] app-card-produto').length).toBe(2);
    // Vitrine do topo: dos ids [1, 5, 15], os dados de teste têm 1 e 5.
    expect(el.querySelectorAll('.vitrine__item').length).toBe(2);
  });
});
