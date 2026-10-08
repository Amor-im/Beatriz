import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/** "01310100" → "01310-100". Aceita qualquer texto e mantém só os 8 primeiros dígitos. */
export function formatarCep(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

/**
 * Máscara de CEP para inputs de formulário reativo: <input formControlName="cep" appMascaraCep>.
 * A cada tecla, reescreve o valor no formato 00000-000 (no campo e no FormControl).
 */
@Directive({
  selector: 'input[appMascaraCep]',
  host: {
    '(input)': 'aoDigitar($event)',
    inputmode: 'numeric',
    maxlength: '9',
  },
})
export class MascaraCep {
  private readonly ngControl = inject(NgControl, { optional: true });

  aoDigitar(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const formatado = formatarCep(campo.value);
    if (formatado !== campo.value) {
      campo.value = formatado;
      this.ngControl?.control?.setValue(formatado);
    }
  }
}
