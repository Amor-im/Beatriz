import { DescontoPipe } from './desconto-pipe';

describe('DescontoPipe', () => {
  const pipe = new DescontoPipe();

  it('aplica o percentual e arredonda para centavos', () => {
    expect(pipe.transform(109.95, 10)).toBe(98.96);
    expect(pipe.transform(109, 10)).toBe(98.1);
  });

  it('sem percentual, devolve o próprio valor', () => {
    expect(pipe.transform(50)).toBe(50);
  });

  it('limita o percentual entre 0 e 100', () => {
    expect(pipe.transform(80, 150)).toBe(0);
    expect(pipe.transform(80, -20)).toBe(80);
  });

  it('devolve 0 para valores que não são número', () => {
    expect(pipe.transform(null)).toBe(0);
    expect(pipe.transform(undefined)).toBe(0);
    expect(pipe.transform(NaN, 10)).toBe(0);
  });
});
