import { calcularFrete, faltaParaFreteGratis, FRETE_GRATIS_A_PARTIR_DE, VALOR_FRETE } from './frete';

describe('frete', () => {
  it('não cobra frete de carrinho vazio', () => {
    expect(calcularFrete(0)).toBe(0);
  });

  it('cobra o valor padrão abaixo do limite', () => {
    expect(calcularFrete(FRETE_GRATIS_A_PARTIR_DE - 0.01)).toBe(VALOR_FRETE);
  });

  it('é grátis a partir do limite', () => {
    expect(calcularFrete(FRETE_GRATIS_A_PARTIR_DE)).toBe(0);
  });

  it('calcula quanto falta para o frete grátis, sem erro de centavos', () => {
    expect(faltaParaFreteGratis(196.2)).toBe(102.8);
    expect(faltaParaFreteGratis(500)).toBe(0);
  });
});
