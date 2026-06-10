import { ScoreMap } from '../models';

/** Persistance locale des pronostics de l'utilisateur (lecture/écriture). */
export interface PersistencePort {
  loadPredictions(): ScoreMap;
  savePredictions(map: ScoreMap): void;
  clearPredictions(): void;
}
