// Regras de frete da loja de demonstração, em dólar como os preços (valores fictícios, não há entrega real).
export const FRETE_GRATIS_A_PARTIR_DE = 299;
export const VALOR_FRETE = 24.9;

export function calcularFrete(subtotal: number): number {
  if (subtotal <= 0) {
    return 0;
  }
  return subtotal >= FRETE_GRATIS_A_PARTIR_DE ? 0 : VALOR_FRETE;
}

/** Quanto falta para o frete grátis (0 quando já atingiu). */
export function faltaParaFreteGratis(subtotal: number): number {
  return Math.max(0, arredondarCentavos(FRETE_GRATIS_A_PARTIR_DE - subtotal));
}

export function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}
