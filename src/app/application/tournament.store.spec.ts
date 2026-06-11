import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { SCHEDULE } from '../domain/data/schedule';
import { GroupId, ScoreMap } from '../domain/models';
import { required } from '../domain/util/required';
import { ClockStub, FileIoSpy, OfficialResultsStub, PersistenceStub } from '../testing/test-doubles';
import { CLOCK, FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from './tokens';
import { TournamentStore } from './tournament.store';

interface Harness {
  store: TournamentStore;
  persistence: PersistenceStub;
  fileIo: FileIoSpy;
  clock: ClockStub;
}

function configure(opts: { predictions?: ScoreMap; official?: ScoreMap; now?: number } = {}): Harness {
  const persistence = new PersistenceStub(opts.predictions ?? {});
  const fileIo = new FileIoSpy();
  const clock = new ClockStub(opts.now ?? 0);
  TestBed.configureTestingModule({
    providers: [
      { provide: PERSISTENCE, useValue: persistence },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub(opts.official ?? {}) },
      { provide: FILE_IO, useValue: fileIo },
      { provide: CLOCK, useValue: clock },
    ],
  });
  return { store: TestBed.inject(TournamentStore), persistence, fileIo, clock };
}

function pointsOf(store: TournamentStore, teamId: string): number {
  const groupId = teamId.charAt(0) as GroupId;
  const group = required(store.groups().get(groupId), `groupe ${groupId}`);
  return required(
    group.standings.find((r) => r.teamId === teamId),
    teamId,
  ).points;
}

describe('TournamentStore', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('setScore', () => {
    test('recalcule le runtime quand on saisit un score', () => {
      const { store } = configure();
      store.setScore('M1', 'home', 2);
      store.setScore('M1', 'away', 0);
      expect(pointsOf(store, 'A1')).toBe(3);
    });

    test('persiste les pronostics via l’effect réactif', () => {
      const { store, persistence } = configure();
      store.setScore('M1', 'home', 1);
      store.setScore('M1', 'away', 0);
      TestBed.tick();
      expect(persistence.loadPredictions()['M1']).toEqual({ home: 1, away: 0 });
    });

    test('ignore une valeur négative ou non entière', () => {
      const { store } = configure();
      store.setScore('M1', 'home', -1);
      store.setScore('M1', 'away', 1.5);
      expect(store.effective()['M1']).toBeUndefined();
    });

    test('garde : sans effet sur un match verrouillé par l’officiel', async () => {
      const { store } = configure({
        predictions: { M1: { home: 2, away: 0 } },
        official: { M1: { home: 0, away: 3 } },
      });
      await store.loadOfficial();
      store.setScore('M1', 'home', 9);
      expect(JSON.parse(store.exportPredictions()).scores['M1']).toEqual({ home: 2, away: 0 });
    });
  });

  describe('pickPenaltyWinner', () => {
    test('désigne le vainqueur aux tirs au but sur un nul KO', () => {
      const { store } = configure();
      store.setScore('M73', 'home', 1);
      store.setScore('M73', 'away', 1);
      store.pickPenaltyWinner('M73', 'away');
      expect(store.effective()['M73']).toEqual({ home: 1, away: 1, winner: 'away' });
    });

    test('sans effet si le match n’est pas un nul', () => {
      const { store } = configure();
      store.setScore('M73', 'home', 2);
      store.setScore('M73', 'away', 1);
      store.pickPenaltyWinner('M73', 'away');
      expect(store.effective()['M73']?.winner).toBeUndefined();
    });

    test('garde : sans effet sur un match verrouillé', async () => {
      const { store } = configure({
        predictions: { M73: { home: 1, away: 1, winner: 'home' } },
        official: { M73: { home: 1, away: 1, winner: 'home' } },
      });
      await store.loadOfficial();
      store.pickPenaltyWinner('M73', 'away');
      expect(JSON.parse(store.exportPredictions()).scores['M73'].winner).toBe('home');
    });
  });

  describe('loadOfficial', () => {
    test('l’officiel écrase le prono et verrouille le match', async () => {
      const { store } = configure({
        predictions: { M1: { home: 2, away: 0 } },
        official: { M1: { home: 0, away: 3 } },
      });
      await store.loadOfficial();
      expect(store.isEditable('M1')).toBe(false);
      expect(pointsOf(store, 'A2')).toBe(3);
      expect(store.comparison()['M1']?.verdict).toBe('wrong');
    });
  });

  describe('isEditable', () => {
    test('vrai sans officiel, faux avec officiel', async () => {
      const { store } = configure({ official: { M1: { home: 1, away: 0 } } });
      expect(store.isEditable('M2')).toBe(true);
      await store.loadOfficial();
      expect(store.isEditable('M1')).toBe(false);
    });

    test('éditable avant le coup d’envoi', () => {
      const kickoff = Date.parse(required(SCHEDULE['M1']?.kickoff, 'kickoff M1'));
      const { store } = configure({ now: kickoff - 60_000 });
      expect(store.isEditable('M1')).toBe(true);
    });

    test('verrouillé une fois le coup d’envoi passé', () => {
      const kickoff = Date.parse(required(SCHEDULE['M1']?.kickoff, 'kickoff M1'));
      const { store } = configure({ now: kickoff + 60_000 });
      expect(store.isEditable('M1')).toBe(false);
    });

    test('refuse la saisie sur un match déjà commencé', () => {
      const kickoff = Date.parse(required(SCHEDULE['M1']?.kickoff, 'kickoff M1'));
      const { store } = configure({ now: kickoff + 60_000 });
      store.setScore('M1', 'home', 3);
      expect(store.effective()['M1']).toBeUndefined();
    });
  });

  describe('importPredictions', () => {
    test('rejette un JSON invalide', () => {
      const { store } = configure();
      expect(store.importPredictions({ version: 99, scores: {} }).ok).toBe(false);
    });

    test('accepte un JSON valide et recalcule', () => {
      const { store } = configure();
      const res = store.importPredictions({ version: 1, scores: { M1: { home: 1, away: 0 } } });
      expect(res.ok).toBe(true);
      expect(pointsOf(store, 'A1')).toBe(3);
    });
  });

  describe('exportPredictions', () => {
    test('sérialise { version, scores }', () => {
      const { store } = configure({ predictions: { M1: { home: 1, away: 0 } } });
      expect(JSON.parse(store.exportPredictions())).toEqual({
        version: 1,
        scores: { M1: { home: 1, away: 0 } },
      });
    });
  });

  describe('downloadPredictions', () => {
    test('télécharge le JSON exporté via le port fichier', () => {
      const { store, fileIo } = configure({ predictions: { M1: { home: 1, away: 0 } } });
      store.downloadPredictions();
      expect(fileIo.downloads.length).toBe(1);
      expect(fileIo.downloads[0]?.filename).toBe('world-cup-2026-predictions.json');
      expect(JSON.parse(required(fileIo.downloads[0], 'download').content).scores['M1']).toEqual({
        home: 1,
        away: 0,
      });
    });
  });

  describe('reset', () => {
    test('efface les pronostics mais conserve les officiels', async () => {
      const { store } = configure({
        predictions: { M2: { home: 1, away: 0 } },
        official: { M1: { home: 0, away: 3 } },
      });
      await store.loadOfficial();
      store.reset();
      expect(store.progress().total).toBe(1);
      expect(store.isEditable('M1')).toBe(false);
    });
  });
});
