import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { formatarCep, MascaraCep } from './mascara-cep';

describe('formatarCep', () => {
  it('coloca o hífen depois do quinto dígito', () => {
    expect(formatarCep('01310100')).toBe('01310-100');
  });

  it('remove o que não é número e limita a 8 dígitos', () => {
    expect(formatarCep('01.310-100999')).toBe('01310-100');
    expect(formatarCep('abc')).toBe('');
  });

  it('não coloca hífen enquanto a pessoa ainda digita os 5 primeiros', () => {
    expect(formatarCep('0131')).toBe('0131');
  });
});

@Component({
  imports: [ReactiveFormsModule, MascaraCep],
  template: `<input [formControl]="cep" appMascaraCep />`,
})
class HostTeste {
  cep = new FormControl('');
}

describe('MascaraCep (diretiva)', () => {
  it('formata o valor do campo e do FormControl enquanto a pessoa digita', () => {
    const fixture = TestBed.createComponent(HostTeste);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = '01310100';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('01310-100');
    expect(fixture.componentInstance.cep.value).toBe('01310-100');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});
