import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ScoreMap } from '../domain/models';
import {
  InMemoryPersistence,
  NoopFileIo,
  StaticOfficialResultsProvider,
} from '../testing/test-doubles';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from './tokens';
import { TournamentStore } from './tournament.store';

function configure(opts: {
  predictions?: ScoreMap;
  official?: ScoreMap;
}): { store: TournamentStore; persistence: InMemoryPersistence } {
  const persistence = new InMemoryPersistence(opts.predictions ?? {});
  TestBed.configureTestingModule({
    providers: [
      { provide: PERSISTENCE, useValue: persistence },
      { provide: OFFICIAL_RESULTS, useValue: new StaticOfficialResultsProvider(opts.official ?? {}) },
      { provide: FILE_IO, useValue: new NoopFileIo() },
    ],
  });
  return { store: TestBed.inject(TournamentStore), persistence };
}

describe('TournamentStore', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('recalcule le runtime quand on saisit un score', () => {
    const { store } = configure({});
    store.setScore('M1', 'home', 2);
    store.setScore('M1', 'away', 0);
    const a1 = store.groups().A.standings.find((r) => r.teamId === 'A1')!;
    expect(a1.points).toBe(3);
  });

  it('persiste les pronostics (effect réactif)', () => {
    const { store, persistence } = configure({});
    store.setScore('M1', 'home', 1);
    store.setScore('M1', 'away', 0);
    TestBed.tick(); // flush des effects (zoneless)
    expect(persistence.loadPredictions()['M1']).toEqual({ home: 1, away: 0 });
  });

  it("l'officiel (serveur) écrase le prono et verrouille le match", async () => {
    const { store } = configure({
      predictions: { M1: { home: 2, away: 0 } }, // prono : A1 gagne
      official: { M1: { home: 0, away: 3 } }, // officiel : A2 gagne
    });
    await store.loadOfficial();

    expect(store.isEditable('M1')).toBe(false);
    const a2 = store.groups().A.standings.find((r) => r.teamId === 'A2')!;
    expect(a2.points).toBe(3);
    expect(store.comparison()['M1']!.verdict).toBe('wrong');
  });

  it('GARDE : setScore/pickPenaltyWinner sur un match verrouillé sont sans effet', async () => {
    const { store } = configure({
      predictions: { M1: { home: 2, away: 0 } },
      official: { M1: { home: 0, away: 3 } },
    });
    await store.loadOfficial();
    store.setScore('M1', 'home', 9); // tentative ignorée
    // le pronostic d'origine n'est pas modifié
    expect(JSON.parse(store.exportPredictions()).scores['M1']).toEqual({ home: 2, away: 0 });
  });

  it('importPredictions rejette un JSON invalide et accepte un valide', () => {
    const { store } = configure({});
    expect(store.importPredictions({ version: 99, scores: {} }).ok).toBe(false);
    const good = store.importPredictions({ version: 1, scores: { M1: { home: 1, away: 0 } } });
    expect(good.ok).toBe(true);
    expect(store.groups().A.standings.find((r) => r.teamId === 'A1')!.points).toBe(3);
  });

  it('reset efface les pronostics mais pas les officiels', async () => {
    const { store } = configure({
      predictions: { M2: { home: 1, away: 0 } },
      official: { M1: { home: 0, away: 3 } },
    });
    await store.loadOfficial();
    store.reset();
    expect(store.progress().total).toBe(1); // reste M1 officiel
    expect(store.isEditable('M1')).toBe(false);
  });
});
