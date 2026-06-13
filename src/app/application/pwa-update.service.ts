import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Gère les mises à jour de la PWA (service worker).
 *
 * - Nouvelle version prête → invite « Recharger » (bascule propre sur le nouveau
 *   bundle, évite l'état hybride ancien/nouveau qui casse l'affichage).
 * - État de cache irrécupérable → propose un rechargement de récupération.
 *
 * No-op hors production (SW désactivé → `isEnabled` faux).
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly updates = inject(SwUpdate);
  private readonly snack = inject(MatSnackBar);
  /** Vérifie périodiquement une nouvelle version (en plus du contrôle au chargement). */
  private static readonly CHECK_INTERVAL_MS = 30 * 60 * 1000;

  start(): void {
    if (!this.updates.isEnabled) return;

    this.updates.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.prompt('Nouvelle version disponible.'));

    // Cache corrompu / incohérent → seul un rechargement récupère un état sain.
    this.updates.unrecoverable.subscribe(() =>
      this.prompt('Problème de cache détecté.', true),
    );

    void this.updates.checkForUpdate();
    setInterval(() => void this.updates.checkForUpdate(), PwaUpdateService.CHECK_INTERVAL_MS);
  }

  private prompt(message: string, hardReload = false): void {
    const ref = this.snack.open(message, 'Recharger');
    ref.onAction().subscribe(() => {
      if (hardReload) {
        document.location.reload();
        return;
      }
      void this.updates.activateUpdate().then(() => document.location.reload());
    });
  }
}
