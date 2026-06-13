import { DraftScoreMap, ScoreMap } from '../domain/models';
import { AuthPort, AuthUser } from '../domain/ports/auth.port';
import { ClockPort } from '../domain/ports/clock.port';
import { FileIoPort } from '../domain/ports/file-io.port';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { LeaderboardRow, ProfilePort } from '../domain/ports/profile.port';
import { RemotePredictionsPort } from '../domain/ports/remote-predictions.port';
import { ConflictChoice, SyncPromptsPort } from '../domain/ports/sync-prompts.port';
import { Result, err, ok } from '../domain/validation/result';

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

/** Auth en mémoire : session réglable + notification des écouteurs. */
export class AuthStub implements AuthPort {
  private readonly listeners = new Set<(user: AuthUser | null) => void>();
  constructor(private user: AuthUser | null = null) {}
  currentUser(): AuthUser | null {
    return this.user;
  }
  async signInWithGoogle(): Promise<void> {
    /* no-op : la session est pilotée par set() dans les tests */
  }
  async requestEmailCode(): Promise<Result<void>> {
    return ok(undefined);
  }
  async verifyEmailCode(): Promise<Result<void>> {
    return ok(undefined);
  }
  async signOut(): Promise<void> {
    this.set(null);
  }
  onChange(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.user);
    return () => {
      this.listeners.delete(cb);
    };
  }
  /** Change la session courante et notifie les écouteurs (simule un (dé)login). */
  set(user: AuthUser | null): void {
    this.user = user;
    for (const cb of this.listeners) cb(user);
  }
}

/** Pronostics distants en mémoire ; `failNextSave` simule une panne réseau. */
export class RemotePredictionsStub implements RemotePredictionsPort {
  readonly saved = new Map<string, DraftScoreMap>();
  failNextSave = false;
  constructor(initial: Readonly<Record<string, DraftScoreMap>> = {}) {
    for (const [userId, map] of Object.entries(initial)) this.saved.set(userId, map);
  }
  async load(userId: string): Promise<DraftScoreMap | null> {
    return this.saved.get(userId) ?? null;
  }
  async save(userId: string, map: DraftScoreMap): Promise<void> {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error('panne réseau simulée');
    }
    this.saved.set(userId, map);
  }
}

/** Profils/pseudos en mémoire + classement réglable. Unicité du pseudo appliquée. */
export class ProfileStub implements ProfilePort {
  private readonly pseudos = new Map<string, string>();
  rows: readonly LeaderboardRow[] = [];
  async get(userId: string): Promise<{ pseudo: string } | null> {
    const pseudo = this.pseudos.get(userId);
    return pseudo ? { pseudo } : null;
  }
  async setPseudo(userId: string, pseudo: string): Promise<Result<void>> {
    for (const [id, existing] of this.pseudos) {
      if (existing === pseudo && id !== userId) return err('Ce pseudo est déjà pris.');
    }
    this.pseudos.set(userId, pseudo);
    return ok(undefined);
  }
  async leaderboard(): Promise<readonly LeaderboardRow[]> {
    return this.rows;
  }
}

/** Dialogues de synchronisation scriptés (réponses pré-réglées + journal des toasts). */
export class SyncPromptsStub implements SyncPromptsPort {
  /** File de réponses pour choosePseudo ; vide → renvoie `defaultPseudo`. */
  pseudoAnswers: (string | null)[] = [];
  defaultPseudo = 'joueur';
  importAnswer = true;
  conflictAnswer: ConflictChoice = 'remote';
  readonly notifications: string[] = [];
  async choosePseudo(): Promise<string | null> {
    if (this.pseudoAnswers.length === 0) return this.defaultPseudo;
    const next = this.pseudoAnswers.shift();
    return next ?? null;
  }
  async confirmImport(): Promise<boolean> {
    return this.importAnswer;
  }
  async resolveConflict(): Promise<ConflictChoice> {
    return this.conflictAnswer;
  }
  notify(message: string): void {
    this.notifications.push(message);
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
