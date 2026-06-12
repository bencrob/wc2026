import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConflictChoice, SyncPromptsPort } from '../domain/ports/sync-prompts.port';

/**
 * Implémentation navigateur des dialogues de synchronisation (confirm / prompt
 * natifs + snackbar), dans la lignée de l'usage de `confirm()` existant pour la
 * réinitialisation. Substituable par un stub dans les tests.
 */
@Injectable({ providedIn: 'root' })
export class BrowserSyncPrompts implements SyncPromptsPort {
  private readonly snack = inject(MatSnackBar);

  async choosePseudo(opts: { suggested: string; error?: string }): Promise<string | null> {
    const prefix = opts.error ? `${opts.error}\n\n` : '';
    const answer = window.prompt(`${prefix}Choisissez votre pseudo (visible au classement) :`, opts.suggested);
    const trimmed = answer?.trim();
    return trimmed ? trimmed : null;
  }

  async confirmImport(localCount: number): Promise<boolean> {
    return window.confirm(
      `Importer vos ${localCount} pronostic(s) enregistré(s) sur cet appareil dans votre compte ?`,
    );
  }

  async resolveConflict(localCount: number, remoteCount: number): Promise<ConflictChoice> {
    const keepCloud = window.confirm(
      `Pronostics présents des deux côtés : ${localCount} sur cet appareil, ${remoteCount} dans votre compte.\n\n` +
        `OK = garder ceux du compte (cloud)\n` +
        `Annuler = choisir ceux de cet appareil`,
    );
    if (keepCloud) return 'remote';
    const overwrite = window.confirm(
      'Écraser les pronostics du compte par ceux de cet appareil ? Action irréversible.',
    );
    return overwrite ? 'local' : 'cancel';
  }

  notify(message: string): void {
    this.snack.open(message, 'OK', { duration: 4000 });
  }
}
