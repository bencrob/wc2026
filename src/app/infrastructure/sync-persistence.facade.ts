import { Injectable, inject } from '@angular/core';
import { AUTH, REMOTE_PREDICTIONS } from '../application/tokens';
import { DraftScoreMap } from '../domain/models';
import { PersistencePort } from '../domain/ports/persistence.port';
import { LocalStoragePersistence } from './local-storage.persistence';

/**
 * Persistance « write-through » : écriture localStorage SYNCHRONE immédiate
 * (boot instantané + offline) + push distant ASYNCHRONE débouncé quand un compte
 * est connecté. Résout l'écart entre le contrat synchrone du `PersistencePort`
 * (piloté par un effect) et la sauvegarde distante asynchrone.
 *
 * localStorage est toujours à jour → il sert de file d'attente durable : en cas
 * d'échec réseau, on reste « dirty » et on retente au prochain save ou sur l'
 * évènement `online`.
 */
@Injectable({ providedIn: 'root' })
export class SyncPersistenceFacade implements PersistencePort {
  private readonly local = inject(LocalStoragePersistence);
  private readonly auth = inject(AUTH);
  private readonly remote = inject(REMOTE_PREDICTIONS);

  private static readonly PUSH_DEBOUNCE_MS = 1500;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: DraftScoreMap | null = null;
  private dirty = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.flush());
    }
  }

  loadPredictions(): DraftScoreMap {
    return this.local.loadPredictions();
  }

  savePredictions(map: DraftScoreMap): void {
    this.local.savePredictions(map); // cache local synchrone (offline-safe)
    if (!this.auth.currentUser()) return; // anonyme : pas de push distant
    this.pending = map;
    this.dirty = true;
    this.scheduleFlush();
  }

  clearPredictions(): void {
    this.local.clearPredictions();
    if (!this.auth.currentUser()) return;
    this.pending = {};
    this.dirty = true;
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, SyncPersistenceFacade.PUSH_DEBOUNCE_MS);
  }

  private async flush(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || !this.dirty || this.pending === null) return;
    const snapshot = this.pending;
    try {
      await this.remote.save(user.id, snapshot);
      if (this.pending === snapshot) this.dirty = false; // rien de plus récent entre-temps
    } catch {
      /* échec réseau : on reste « dirty », retente au prochain save / 'online' */
    }
  }
}
