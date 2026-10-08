import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
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
  nome: { required: 'Digite seu nome completo.', pattern: 'Digite nome e sobrenome.' },
  email: { required: 'Digite seu e-mail.', email: 'Confira o e-mail: ele precisa ter @ e domínio, como nome@exemplo.com.' },
  cep: { required: 'Digite o CEP.', pattern: 'O CEP tem 8 números, no formato 00000-000.' },
  endereco: { required: 'Digite a rua ou avenida.' },
  numero: { required: 'Digite o número (ou "s/n").' },
  cidade: { required: 'Digite a cidade.' },
  uf: { required: 'Escolha o estado.' },
};

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    // Pelo menos duas palavras: "Ana Souza". Só espaços não passa.
    nome: ['', [Validators.required, Validators.pattern(/\S+\s+\S+/)]],
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

  /** Mostra o erro depois que a pessoa sai do campo (touched). Ao confirmar, todos viram touched. */
  protected mostrarErro(controle: AbstractControl): boolean {
    return controle.invalid && controle.touched;
  }

  /** Devolve a mensagem do primeiro erro do campo (ou null se o campo está válido). */
  protected erro(campo: CampoComErro): string | null {
    const controle = this.form.controls[campo];
    if (!this.mostrarErro(controle) || !controle.errors) return null;
    const tipo = Object.keys(controle.errors)[0];
    return MENSAGENS[campo][tipo] ?? 'Confira este campo.';
  }

  confirmar(): void {
    // Evita um segundo clique criar outro pedido enquanto o primeiro é confirmado.
    if (this.enviando() || this.carrinho.vazio()) {
      return;
    }
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
      // `enviando` continua true: o botão fica desabilitado até a página de confirmação abrir.
      .subscribe(() => this.router.navigate(['/pedido-confirmado']));
  }
}
