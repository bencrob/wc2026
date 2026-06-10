import { ScoreMap } from '../domain/models';
import { FileIoPort } from '../domain/ports/file-io.port';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { PersistencePort } from '../domain/ports/persistence.port';

/** Persistance en mémoire (substitut LSP de LocalStoragePersistence). */
export class InMemoryPersistence implements PersistencePort {
  constructor(private store: ScoreMap = {}) {}
  loadPredictions(): ScoreMap {
    return this.store;
  }
  savePredictions(map: ScoreMap): void {
    this.store = map;
  }
  clearPredictions(): void {
    this.store = {};
  }
}

/** Source officielle statique (substitut LSP de RemoteOfficialResultsProvider). */
export class StaticOfficialResultsProvider implements OfficialResultsPort {
  constructor(public results: ScoreMap = {}) {}
  fetch(): Promise<ScoreMap> {
    return Promise.resolve(this.results);
  }
}

/** I/O fichier sans effet (capture les exports pour assertion). */
export class NoopFileIo implements FileIoPort {
  readonly downloads: { filename: string; content: string }[] = [];
  download(filename: string, content: string): void {
    this.downloads.push({ filename, content });
  }
  readText(): Promise<string> {
    return Promise.resolve('');
  }
}
