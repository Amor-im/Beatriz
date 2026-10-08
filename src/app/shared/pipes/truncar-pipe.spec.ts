import { Truncar } from './truncar-pipe';

describe('Truncar (pipe truncar)', () => {
  const pipe = new Truncar();

  it('não mexe em texto menor que o limite', () => {
    expect(pipe.transform('Mochila', 20)).toBe('Mochila');
  });

  it('corta no último espaço antes do limite e acrescenta reticências', () => {
    expect(pipe.transform('Mochila para notebook de 15 polegadas', 20)).toBe('Mochila para…');
  });

  it('com limite=false, corta exatamente no número de caracteres', () => {
    expect(pipe.transform('Mochila para notebook', 10, false)).toBe('Mochila pa…');
  });

  it('aceita outro sufixo', () => {
    expect(pipe.transform('Mochila para notebook', 10, true, '...')).toBe('Mochila...');
  });

  it('devolve texto vazio para null ou undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
