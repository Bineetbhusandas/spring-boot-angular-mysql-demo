import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // withFetch() uses the modern Fetch API instead of XMLHttpRequest.
    provideHttpClient(withFetch()),

    provideRouter(
      routes,
      // Route params/data can be read through component inputs.
      withComponentInputBinding(),
      // New navigations start at the top of the page.
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
};
