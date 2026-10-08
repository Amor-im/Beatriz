import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MascaraCep } from '../../../shared/diretivas/mascara-cep';
import { CarrinhoService } from '../carrinho.service';
import { FormaPagamento, PedidoService } from '../pedido.service';
import { ResumoPedido } from '../resumo-pedido/resumo-pedido';

export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

type CampoComErro = 'nome' | 'email' | 'cep' | 'endereco' | 'numero' | 'cidade' | 'uf';

/** Mensagens de erro por campo e por tipo de erro do validador. */
const MENSAGENS: Record<CampoComErro, Record<string, string>> = {
  nome: { required: 'Digite seu nome completo.', minlength: 'Digite nome e sobrenome.' },
  email: { required: 'Digite seu e-mail.', email: 'Confira o e-mail: ele precisa ter @ e domínio, como nome@exemplo.com.' },
  cep: { required: 'Digite o CEP.', pattern: 'O CEP tem 8 números, no formato 00000-000.' },
  endereco: { required: 'Digite a rua ou avenida.' },
  numero: { required: 'Digite o número (ou "s/n").' },
  cidade: { required: 'Digite a cidade.' },
  uf: { required: 'Escolha o estado.' },
};

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, MascaraCep, ResumoPedido],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly carrinho = inject(CarrinhoService);

  protected readonly ufs = UFS;
  protected readonly formasPagamento: { valor: FormaPagamento; rotulo: string; dica: string }[] = [
    { valor: 'pix', rotulo: 'Pix', dica: 'Aprovação na hora' },
    { valor: 'cartao', rotulo: 'Cartão de crédito', dica: 'Sem dados de cartão nesta simulação' },
    { valor: 'boleto', rotulo: 'Boleto', dica: 'Vencimento em 3 dias úteis' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    endereco: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    cidade: ['', Validators.required],
    uf: ['', Validators.required],
    pagamento: ['pix' as FormaPagamento, Validators.required],
  });

  protected readonly enviando = signal(false);
  protected readonly tentouEnviar = signal(false);

  protected mostrarErro(controle: AbstractControl): boolean {
    return controle.invalid && (controle.touched || this.tentouEnviar());
  }

  /** Devolve a mensagem do primeiro erro do campo (ou null se o campo está válido). */
  protected erro(campo: CampoComErro): string | null {
    const controle = this.form.controls[campo];
    if (!this.mostrarErro(controle) || !controle.errors) return null;
    const tipo = Object.keys(controle.errors)[0];
    return MENSAGENS[campo][tipo] ?? 'Confira este campo.';
  }

  confirmar(): void {
    this.tentouEnviar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() =>
        this.elemento.nativeElement.querySelector<HTMLElement>('form .ng-invalid')?.focus(),
      );
      return;
    }

    this.enviando.set(true);
    this.pedidoService
      .finalizar(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.enviando.set(false);
        this.router.navigate(['/pedido-confirmado']);
      });
  }
}
