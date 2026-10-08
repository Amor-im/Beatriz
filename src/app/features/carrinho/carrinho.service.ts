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

  /**
   * Adiciona o produto (ou soma à quantidade que já está no carrinho), até o limite de 10.
   * Devolve quantas unidades entraram de fato: 0 quando o limite já foi atingido.
   */
  adicionar(produto: Produto, quantidade = 1): number {
    if (quantidade <= 0 || produto.estado === 'esgotado') {
      return 0;
    }
    const noCarrinho = this._itens().find((item) => item.produto.id === produto.id)?.quantidade ?? 0;
    const adicionadas = Math.min(quantidade, QUANTIDADE_MAXIMA - noCarrinho);
    if (adicionadas <= 0) {
      return 0;
    }

    this._itens.update((itens) =>
      noCarrinho === 0
        ? [...itens, { produto, quantidade: adicionadas }]
        : // Imutável: cria um novo array e um novo item em vez de alterar o objeto antigo.
          itens.map((item) =>
            item.produto.id === produto.id
              ? { ...item, quantidade: item.quantidade + adicionadas }
              : item,
          ),
    );
    return adicionadas;
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

  /**
   * O carrinho salvo guarda uma cópia de cada produto, com o preço da hora em que foi adicionado.
   * As páginas de carrinho e checkout chamam este método com o catálogo atual: preço, promoção
   * e estoque são atualizados, e produtos que esgotaram saem. Devolve quantos itens saíram.
   */
  atualizarProdutos(catalogo: readonly Produto[]): number {
    let removidos = 0;
    const atualizados = this._itens().flatMap((item) => {
      const atual = catalogo.find((p) => p.id === item.produto.id);
      if (!atual) {
        return [item];
      }
      if (atual.estado === 'esgotado') {
        removidos++;
        return [];
      }
      return [{ ...item, produto: atual }];
    });
    this._itens.set(atualizados);
    return removidos;
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
    Number.isInteger(candidato?.quantidade) &&
    candidato.quantidade > 0 &&
    candidato.quantidade <= QUANTIDADE_MAXIMA &&
    typeof candidato.produto?.id === 'number' &&
    typeof candidato.produto?.preco === 'number'
  );
}

/** Texto do aviso depois de adicionar, a partir de quantas unidades entraram de fato. */
export function mensagemAdicao(adicionadas: number): string {
  if (adicionadas === 0) {
    return `Você já tem o máximo de ${QUANTIDADE_MAXIMA} unidades deste produto no carrinho`;
  }
  return adicionadas === 1
    ? '1 unidade adicionada ao carrinho'
    : `${adicionadas} unidades adicionadas ao carrinho`;
}
