import { DraftScoreMap } from '../models';

/** Persistance locale des pronostics de l'utilisateur (lecture/écriture). */
export interface PersistencePort {
  loadPredictions(): DraftScoreMap;
  savePredictions(map: DraftScoreMap): void;
  clearPredictions(): void;
}
