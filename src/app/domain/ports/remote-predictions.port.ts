import { DraftScoreMap } from '../models';

/**
 * Persistance distante des pronostics, par compte (asynchrone).
 *
 * Distinct du `PersistencePort` (synchrone, cache local) : la facade de
 * synchronisation combine les deux (écriture locale immédiate + push distant
 * débouncé).
 */
export interface RemotePredictionsPort {
  /** Charge les pronostics du compte ; `null` si aucune ligne n'existe encore. */
  load(userId: string): Promise<DraftScoreMap | null>;
  /** Écrit (upsert) les pronostics du compte. */
  save(userId: string, map: DraftScoreMap): Promise<void>;
}
