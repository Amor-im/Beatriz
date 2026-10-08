import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { formatarTitulo, TituloPaginaStrategy } from './titulo-pagina.strategy';

@Component({ template: '' })
class PaginaVazia {}

describe('TituloPaginaStrategy', () => {
  it('formatarTitulo acrescenta o nome da loja', () => {
    expect(formatarTitulo('Carrinho')).toBe('Carrinho | Vitrine');
    expect(formatarTitulo()).toBe('Vitrine');
  });

  it('usa o title da rota na aba do navegador', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'carrinho', title: 'Carrinho', component: PaginaVazia }]),
        { provide: TitleStrategy, useClass: TituloPaginaStrategy },
      ],
    });

    await TestBed.inject(Router).navigateByUrl('/carrinho');

    expect(TestBed.inject(Title).getTitle()).toBe('Carrinho | Vitrine');
  });
});
