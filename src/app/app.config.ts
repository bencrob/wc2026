import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AccountSyncService } from './application/account-sync.service';
import { PwaUpdateService } from './application/pwa-update.service';
import { TournamentStore } from './application/tournament.store';
import {
  AUTH,
  CLOCK,
  FILE_IO,
  OFFICIAL_RESULTS,
  PERSISTENCE,
  PROFILE,
  REMOTE_PREDICTIONS,
  SYNC_PROMPTS,
} from './application/tokens';
import { BrowserClock } from './infrastructure/browser-clock';
import { BrowserFileIo } from './infrastructure/browser-file-io';
import { BrowserSyncPrompts } from './infrastructure/browser-sync-prompts';
import { RemoteOfficialResultsProvider } from './infrastructure/remote-official-results.provider';
import { SupabaseAuthAdapter } from './infrastructure/supabase-auth.adapter';
import { SupabasePredictionsAdapter } from './infrastructure/supabase-predictions.adapter';
import { SupabaseProfileAdapter } from './infrastructure/supabase-profile.adapter';
import { SyncPersistenceFacade } from './infrastructure/sync-persistence.facade';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    // Câblage des ports (DIP) → implémentations concrètes
    // PERSISTENCE = facade write-through (localStorage synchrone + push distant débouncé)
    { provide: PERSISTENCE, useExisting: SyncPersistenceFacade },
    { provide: OFFICIAL_RESULTS, useExisting: RemoteOfficialResultsProvider },
    { provide: FILE_IO, useExisting: BrowserFileIo },
    { provide: CLOCK, useExisting: BrowserClock },
    // Cloud (auth Google + base) — désactivés tant que l'environnement n'est pas configuré
    { provide: AUTH, useExisting: SupabaseAuthAdapter },
    { provide: REMOTE_PREDICTIONS, useExisting: SupabasePredictionsAdapter },
    { provide: PROFILE, useExisting: SupabaseProfileAdapter },
    { provide: SYNC_PROMPTS, useExisting: BrowserSyncPrompts },
    // Charge les résultats officiels (serveur) au démarrage
    provideAppInitializer(() => inject(TournamentStore).loadOfficial()),
    // Démarre l'écoute de session (import/sync de compte à la connexion)
    provideAppInitializer(() => inject(AccountSyncService).start()),
    // Invite de mise à jour PWA (évite l'état hybride ancien/nouveau bundle)
    provideAppInitializer(() => inject(PwaUpdateService).start()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
