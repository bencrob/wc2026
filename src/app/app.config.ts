import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { TournamentStore } from './application/tournament.store';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from './application/tokens';
import { BrowserFileIo } from './infrastructure/browser-file-io';
import { LocalStoragePersistence } from './infrastructure/local-storage.persistence';
import { RemoteOfficialResultsProvider } from './infrastructure/remote-official-results.provider';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(),
    // Câblage des ports (DIP) → implémentations concrètes
    { provide: PERSISTENCE, useExisting: LocalStoragePersistence },
    { provide: OFFICIAL_RESULTS, useExisting: RemoteOfficialResultsProvider },
    { provide: FILE_IO, useExisting: BrowserFileIo },
    // Charge les résultats officiels (serveur) au démarrage
    provideAppInitializer(() => inject(TournamentStore).loadOfficial()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
