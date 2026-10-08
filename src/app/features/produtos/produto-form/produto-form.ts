import { Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { CATEGORIAS, Produto } from '../../../model/produto';
import { CardProduto } from '../card-produto/card-produto';
import { ProdutoService } from '../produto.service';

const CATEGORIA_OUTRA = 'outra';
const URL_IMAGEM = /^https?:\/\/\S+$/i;

type Envio =
  | { estado: 'parado' }
  | { estado: 'enviando' }
  | { estado: 'sucesso'; id: number; nome: string }
  | { estado: 'erro' };

@Component({
  selector: 'app-produto-form',
  imports: [ReactiveFormsModule, RouterLink, CardProduto],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css',
})
export class ProdutoForm {
  private readonly fb = inject(FormBuilder);
  private readonly produtoService = inject(ProdutoService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categorias = CATEGORIAS;
  protected readonly categoriaOutra = CATEGORIA_OUTRA;
  protected readonly limiteDescricao = 500;

  /** nonNullable: ao resetar, os campos voltam para o valor inicial, e não para null. */
  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    preco: [null as number | null, [Validators.required, Validators.min(1), Validators.max(99999)]],
    descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    categoria: ['', Validators.required],
    novaCategoria: [''],
    imageUrl: ['', Validators.pattern(URL_IMAGEM)],
    promo: [false],
  });

  protected readonly envio = signal<Envio>({ estado: 'parado' });
  protected readonly tentouEnviar = signal(false);

  /** Valores do formulário como signal, para a prévia do card se atualizar enquanto a pessoa digita. */
  private readonly valores = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly mostrarNovaCategoria = computed(
    () => this.valores().categoria === CATEGORIA_OUTRA,
  );
  protected readonly tamanhoDescricao = computed(() => this.valores().descricao?.length ?? 0);

  protected readonly previa = computed<Produto>(() => montarProduto(this.valores()));

  constructor() {
    // "Nova categoria" só é obrigatória quando a pessoa escolhe "Outra".
    this.form.controls.categoria.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((categoria) => {
        const campo = this.form.controls.novaCategoria;
        if (categoria === CATEGORIA_OUTRA) {
          campo.setValidators([Validators.required, Validators.minLength(3)]);
        } else {
          campo.clearValidators();
          campo.setValue('');
        }
        campo.updateValueAndValidity();
      });
  }

  /** Mostra o erro depois que a pessoa sai do campo ou tenta salvar. */
  protected mostrarErro(controle: AbstractControl): boolean {
    return controle.invalid && (controle.touched || this.tentouEnviar());
  }

  protected erroNome(): string {
    const c = this.form.controls.nome;
    if (c.hasError('required')) return 'Digite o nome do produto.';
    if (c.hasError('minlength')) return 'Use pelo menos 3 caracteres no nome.';
    return 'Use no máximo 80 caracteres no nome.';
  }

  protected erroPreco(): string {
    const c = this.form.controls.preco;
    if (c.hasError('required')) return 'Informe o preço, por exemplo 129,90.';
    if (c.hasError('min')) return 'O preço precisa ser de pelo menos R$ 1,00.';
    return 'O preço precisa ser de até R$ 99.999,00.';
  }

  protected erroDescricao(): string {
    const c = this.form.controls.descricao;
    if (c.hasError('required')) return 'Escreva uma descrição para o produto.';
    if (c.hasError('minlength')) return 'Use pelo menos 10 caracteres na descrição.';
    return `Use no máximo ${this.limiteDescricao} caracteres na descrição.`;
  }

  salvar(): void {
    this.tentouEnviar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focarPrimeiroErro();
      return;
    }

    const produto = montarProduto(this.form.getRawValue());
    this.envio.set({ estado: 'enviando' });
    this.produtoService
      .criar(produto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.envio.set({ estado: 'sucesso', id: resposta.id, nome: produto.nome });
          this.form.reset();
          this.tentouEnviar.set(false);
        },
        error: () => this.envio.set({ estado: 'erro' }),
      });
  }

  private focarPrimeiroErro(): void {
    // Espera o Angular desenhar as mensagens de erro e leva o foco ao primeiro campo inválido.
    setTimeout(() => {
      this.elemento.nativeElement
        .querySelector<HTMLElement>('form .ng-invalid')
        ?.focus();
    });
  }
}

interface ValoresForm {
  nome: string;
  preco: number | null;
  descricao: string;
  categoria: string;
  novaCategoria: string;
  imageUrl: string;
  promo: boolean;
}

/** Converte os valores do formulário em um Produto (usado na prévia e no envio). */
function montarProduto(v: Partial<ValoresForm>): Produto {
  const imageUrl = v.imageUrl ?? '';
  return {
    id: 0,
    nome: (v.nome ?? '').trim(),
    preco: Number(v.preco) || 0,
    descricao: (v.descricao ?? '').trim(),
    categoria: v.categoria === CATEGORIA_OUTRA ? (v.novaCategoria ?? '').trim() : (v.categoria ?? ''),
    imageUrl: URL_IMAGEM.test(imageUrl) ? imageUrl : undefined,
    promo: v.promo ?? false,
  };
}
