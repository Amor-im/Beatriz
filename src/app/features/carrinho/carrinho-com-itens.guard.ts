import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CarrinhoService } from './carrinho.service';

/** Só deixa entrar no checkout se houver algo no carrinho; senão, volta para o carrinho. */
export const carrinhoComItensGuard: CanActivateFn = () => {
  const carrinho = inject(CarrinhoService);
  return carrinho.vazio() ? inject(Router).createUrlTree(['/carrinho']) : true;
};
