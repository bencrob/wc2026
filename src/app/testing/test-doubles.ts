import { DraftScoreMap, ScoreMap } from '../domain/models';
import { ClockPort } from '../domain/ports/clock.port';
import { FileIoPort } from '../domain/ports/file-io.port';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { PersistencePort } from '../domain/ports/persistence.port';

/** Horloge déterministe : `now` fixe et réglable (substitut de l'horloge système). */
export class ClockStub implements ClockPort {
  constructor(private current = 0) {}
  now(): number {
    return this.current;
  }
  set(ms: number): void {
    this.current = ms;
  }
}

/** Persistance en mémoire (substitut de LocalStoragePersistence). */
export class PersistenceStub implements PersistencePort {
  constructor(private store: DraftScoreMap = {}) {}
  loadPredictions(): DraftScoreMap {
    return this.store;
  }
  savePredictions(map: DraftScoreMap): void {
    this.store = map;
  }
  clearPredictions(): void {
    this.store = {};
  }
}

/** Source officielle statique (substitut de RemoteOfficialResultsProvider). */
export class OfficialResultsStub implements OfficialResultsPort {
  constructor(private readonly results: ScoreMap = {}) {}
  fetch(): Promise<ScoreMap> {
    return Promise.resolve(this.results);
  }
}

/** I/O fichier espionné : capture les exports, fournit un texte d'import. */
export class FileIoSpy implements FileIoPort {
  readonly downloads: { filename: string; content: string }[] = [];
  nextText = '';
  download(filename: string, content: string): void {
    this.downloads.push({ filename, content });
  }
  readText(): Promise<string> {
    return Promise.resolve(this.nextText);
  }
}
