import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { TituloPaginaStrategy } from './core/titulo-pagina.strategy';

// Formatos brasileiros nos pipes: R$ 1.299,90 e datas dd/mm/aaaa.
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Parâmetros da rota (:id) e query params (?busca=) chegam como input() nos componentes.
      withComponentInputBinding(),
      // Ao trocar de página, volta para o topo.
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // Depois que a primeira página abre, baixa as outras em segundo plano:
      // o lazy loading deixa a abertura leve e a navegação continua instantânea.
      withPreloading(PreloadAllModules),
    ),
    { provide: TitleStrategy, useClass: TituloPaginaStrategy },
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
};
