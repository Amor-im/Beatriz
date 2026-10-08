import { Component, computed, inject, signal } from '@angular/core';
import { Produto } from '../../../model/produto';
import { CardProduto } from "../card-produto/card-produto";
import { ProdutoService } from '../produto.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-produtos',
  imports: [CardProduto],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css',
})
export class ListaProdutos {

  private produtoService = inject(ProdutoService);

  private router = inject(Router);

  private produtos = toSignal<Produto[], Produto[]>(this.produtoService.listar().pipe(finalize(() => this.carregando.set(false))), {initialValue:[]});

  public carregando = signal(true);

  
  apenasPromo = signal(false);

  produtosExibidos = computed(()=> this.apenasPromo()
  ? this.produtos().filter(p=>p.promo)
  : this.produtos());

  alternarPromo(){
    this.apenasPromo.update(v=>!v);
  }

  onViewProduct(id:number){
    alert('Visualizando produto id:'+id);
  }

  onAddProduct(produto: {id:number, qtd:number}){
    alert('Adicionando produto'+produto.id+' | quantidade:' +produto.qtd)
  }

  onCreateProduct(rota: string){
    this.router.navigateByUrl(rota);
  }
}
