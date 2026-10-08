import { computed, effect, Injectable, signal } from '@angular/core';
import { precoFinal, Produto } from '../../model/produto';
import { arredondarCentavos, calcularFrete, faltaParaFreteGratis } from './frete';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export const CHAVE_CARRINHO = 'vitrine:carrinho';
export const QUANTIDADE_MAXIMA = 10;

/**
 * Estado do carrinho com signals.
 * - `signal` guarda a lista de itens (a única fonte da verdade);
 * - `computed` deriva totais, que se recalculam sozinhos quando a lista muda;
 * - `effect` salva no localStorage a cada mudança (efeito colateral).
 */
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly _itens = signal<ItemCarrinho[]>(lerDoStorage());

  readonly itens = this._itens.asReadonly();
  readonly vazio = computed(() => this._itens().length === 0);
  readonly quantidadeTotal = computed(() =>
    this._itens().reduce((soma, item) => soma + item.quantidade, 0),
  );
  readonly subtotal = computed(() =>
    arredondarCentavos(
      this._itens().reduce((soma, item) => soma + precoFinal(item.produto) * item.quantidade, 0),
    ),
  );
  readonly frete = computed(() => calcularFrete(this.subtotal()));
  readonly faltaParaFreteGratis = computed(() => faltaParaFreteGratis(this.subtotal()));
  readonly total = computed(() => arredondarCentavos(this.subtotal() + this.frete()));

  constructor() {
    effect(() => salvarNoStorage(this._itens()));
  }

  adicionar(produto: Produto, quantidade = 1): void {
    if (quantidade <= 0 || produto.estado === 'esgotado') {
      return;
    }
    this._itens.update((itens) => {
      const existente = itens.find((item) => item.produto.id === produto.id);
      if (!existente) {
        return [...itens, { produto, quantidade: Math.min(quantidade, QUANTIDADE_MAXIMA) }];
      }
      // Imutável: cria um novo array e um novo item em vez de alterar o objeto antigo.
      return itens.map((item) =>
        item === existente
          ? { ...item, quantidade: Math.min(item.quantidade + quantidade, QUANTIDADE_MAXIMA) }
          : item,
      );
    });
  }

  alterarQuantidade(produtoId: number, quantidade: number): void {
    if (quantidade <= 0) {
      this.remover(produtoId);
      return;
    }
    this._itens.update((itens) =>
      itens.map((item) =>
        item.produto.id === produtoId
          ? { ...item, quantidade: Math.min(quantidade, QUANTIDADE_MAXIMA) }
          : item,
      ),
    );
  }

  remover(produtoId: number): void {
    this._itens.update((itens) => itens.filter((item) => item.produto.id !== produtoId));
  }

  limpar(): void {
    this._itens.set([]);
  }
}

function lerDoStorage(): ItemCarrinho[] {
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    const itens: unknown = salvo ? JSON.parse(salvo) : [];
    return Array.isArray(itens) ? itens.filter(ehItemValido) : [];
  } catch {
    // JSON corrompido ou storage bloqueado (ex.: modo privado): começa vazio.
    return [];
  }
}

function salvarNoStorage(itens: ItemCarrinho[]): void {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  } catch {
    // Sem storage disponível o carrinho continua funcionando, só não persiste.
  }
}

function ehItemValido(item: unknown): item is ItemCarrinho {
  const candidato = item as ItemCarrinho;
  return (
    typeof candidato?.quantidade === 'number' &&
    candidato.quantidade > 0 &&
    typeof candidato.produto?.id === 'number' &&
    typeof candidato.produto?.preco === 'number'
  );
}
