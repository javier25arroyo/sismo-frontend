import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { authInterceptor } from './interceptors/auth.interceptor';
import { SelectivePreloadingStrategy } from './services/selective-preloading.strategy';
import { SeoTitleStrategy } from './services/seo-title.strategy';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    provideRouter(
      routes,
      withPreloading(SelectivePreloadingStrategy),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ), provideClientHydration(withEventReplay())
  ]
};
