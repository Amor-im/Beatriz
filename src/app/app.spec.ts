import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('monta o layout com cabeçalho, conteúdo principal e rodapé', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('header')).not.toBeNull();
    expect(el.querySelector('main#conteudo')).not.toBeNull();
    expect(el.querySelector('footer')).not.toBeNull();
  });

  it('"Pular para o conteúdo" leva o foco ao <main>', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('.pular-conteudo')!.click();

    expect(document.activeElement).toBe(el.querySelector('main'));
  });
});
