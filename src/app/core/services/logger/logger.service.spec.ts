import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('repassa as mensagens para o console', () => {
    const logger = TestBed.inject(LoggerService);
    const info = spyOn(console, 'info');
    const erro = spyOn(console, 'error');

    logger.info('carregou');
    logger.error('falhou', { status: 500 });

    expect(info).toHaveBeenCalledWith('carregou', '');
    expect(erro).toHaveBeenCalledWith('falhou', { status: 500 });
  });
});
