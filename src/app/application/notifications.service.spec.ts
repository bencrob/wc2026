import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SCHEDULE } from '../domain/data/schedule';
import { ScoreMap } from '../domain/models';
import { required } from '../domain/util/required';
import {
  ClockStub,
  FileIoSpy,
  NotificationsStateStub,
  OfficialResultsStub,
  PersistenceStub,
} from '../testing/test-doubles';
import { NotificationsService } from './notifications.service';
import { CLOCK, FILE_IO, NOTIFICATIONS_STATE, OFFICIAL_RESULTS, PERSISTENCE } from './tokens';
import { TournamentStore } from './tournament.store';

interface Options {
  predictions?: ScoreMap;
  official?: ScoreMap;
  seen?: readonly string[] | null;
  now?: number;
}

async function configure(opts: Options = {}) {
  const open = vi.fn();
  const state = new NotificationsStateStub(opts.seen ?? null);
  TestBed.configureTestingModule({
    providers: [
      { provide: PERSISTENCE, useValue: new PersistenceStub(opts.predictions ?? {}) },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub(opts.official ?? {}) },
      { provide: FILE_IO, useValue: new FileIoSpy() },
      { provide: CLOCK, useValue: new ClockStub(opts.now ?? 0) },
      { provide: NOTIFICATIONS_STATE, useValue: state },
      { provide: MatSnackBar, useValue: { open } as unknown as MatSnackBar },
    ],
  });
  const store = TestBed.inject(TournamentStore);
  await store.loadOfficial();
  return { service: TestBed.inject(NotificationsService), open, state };
}

describe('NotificationsService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  test('1re visite : pose la référence sans notifier', async () => {
    const { service, open, state } = await configure({
      official: { M1: { home: 1, away: 0 } },
      seen: null,
    });
    service.checkOnStartup();
    expect(open).not.toHaveBeenCalled();
    expect(state.loadSeenOfficial()).toEqual(['M1']);
  });

  test('nouveaux résultats : notifie avec les points gagnés', async () => {
    const { service, open } = await configure({
      predictions: { M1: { home: 2, away: 0 } },
      official: { M1: { home: 2, away: 0 } }, // exact → 3 pts
      seen: [],
    });
    service.checkOnStartup();
    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0]?.[0])).toContain('+3');
  });

  test('aucun nouveau résultat ni verrouillage imminent : silencieux', async () => {
    const { service, open } = await configure({
      official: { M1: { home: 1, away: 0 } },
      seen: ['M1'],
    });
    service.checkOnStartup();
    expect(open).not.toHaveBeenCalled();
  });

  test('rappel : matchs non pronostiqués qui se verrouillent dans l’heure', async () => {
    const kickoff = Date.parse(required(SCHEDULE['M1']?.kickoff, 'kickoff M1'));
    const { service, open } = await configure({ now: kickoff - 30 * 60 * 1000, seen: null });
    service.checkOnStartup();
    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0]?.[0])).toContain('verrouillent');
  });
});
