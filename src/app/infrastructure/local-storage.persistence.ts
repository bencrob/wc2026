import { Injectable } from '@angular/core';
import { ScoreMap } from '../domain/models';
import { PersistencePort } from '../domain/ports/persistence.port';
import { SCHEMA_VERSION, ScoreMapValidator } from '../domain/validation/score-map.validator';

/** Persistance des pronostics en LocalStorage. Échec silencieux (quota / indispo). */
@Injectable({ providedIn: 'root' })
export class LocalStoragePersistence implements PersistencePort {
  private static readonly KEY = 'world-cup-2026-predictions';
  private readonly validator = new ScoreMapValidator();

  loadPredictions(): ScoreMap {
    try {
      const raw = localStorage.getItem(LocalStoragePersistence.KEY);
      if (!raw) return {};
      const res = this.validator.validatePredictions(JSON.parse(raw));
      return res.ok ? res.value : {};
    } catch {
      return {};
    }
  }

  savePredictions(map: ScoreMap): void {
    try {
      localStorage.setItem(
        LocalStoragePersistence.KEY,
        JSON.stringify({ version: SCHEMA_VERSION, scores: map }),
      );
    } catch {
      /* quota dépassé / indispo : on garde l'état en mémoire */
    }
  }

  clearPredictions(): void {
    try {
      localStorage.removeItem(LocalStoragePersistence.KEY);
    } catch {
      /* ignore */
    }
  }
}
