/** Choix de résolution d'un conflit local ↔ cloud. */
export type ConflictChoice = 'local' | 'remote' | 'cancel';

/**
 * Interactions utilisateur nécessaires à la synchronisation de compte
 * (choix de pseudo, import des pronostics locaux, résolution de conflit).
 *
 * Abstrait pour garder l'orchestration applicative testable (substituable par un
 * stub) et découplée de l'implémentation UI (MatDialog / confirm / snackbar).
 */
export interface SyncPromptsPort {
  /** Demande/redemande un pseudo. `error` = message du refus précédent. Renvoie `null` si annulé. */
  choosePseudo(opts: { suggested: string; error?: string }): Promise<string | null>;
  /** Confirme l'import de `localCount` pronostics locaux dans le compte. */
  confirmImport(localCount: number): Promise<boolean>;
  /** Tranche un conflit : garder le local (`local`), le cloud (`remote`) ou annuler. */
  resolveConflict(localCount: number, remoteCount: number): Promise<ConflictChoice>;
  /** Notifie l'utilisateur (toast). */
  notify(message: string): void;
}
