import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NaoEncontrada } from './nao-encontrada';

describe('NaoEncontrada', () => {
  it('mostra o endereço que não existe e links para voltar', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: NaoEncontrada }])],
    });
    await TestBed.inject(Router).navigateByUrl('/pagina-que-nao-existe');

    const fixture = TestBed.createComponent(NaoEncontrada);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent).toContain('Página não encontrada');
    expect(el.querySelector('code')?.textContent).toBe('/pagina-que-nao-existe');
    expect(el.querySelector('a[href="/produtos"]')).not.toBeNull();
  });
});
