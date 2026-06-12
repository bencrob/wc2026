import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AUTH, REMOTE_PREDICTIONS } from '../application/tokens';
import { AuthUser } from '../domain/ports/auth.port';
import { AuthStub, PersistenceStub, RemotePredictionsStub } from '../testing/test-doubles';
import { LocalStoragePersistence } from './local-storage.persistence';
import { SyncPersistenceFacade } from './sync-persistence.facade';

const USER: AuthUser = { id: 'u1', email: 'a@b.c' };

interface Harness {
  facade: SyncPersistenceFacade;
  remote: RemotePredictionsStub;
  local: PersistenceStub;
}

function configure(user: AuthUser | null = null): Harness {
  const remote = new RemotePredictionsStub();
  const local = new PersistenceStub();
  TestBed.configureTestingModule({
    providers: [
      // Cache local substitué (localStorage indispo en jsdom ici).
      { provide: LocalStoragePersistence, useValue: local },
      { provide: AUTH, useValue: new AuthStub(user) },
      { provide: REMOTE_PREDICTIONS, useValue: remote },
    ],
  });
  return { facade: TestBed.inject(SyncPersistenceFacade), remote, local };
}

describe('SyncPersistenceFacade', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  test('écrit le cache local de façon synchrone', () => {
    const { facade } = configure();
    facade.savePredictions({ M1: { home: 1, away: 0 } });
    expect(facade.loadPredictions()).toEqual({ M1: { home: 1, away: 0 } });
  });

  test('déconnecté : aucun push distant', async () => {
    const { facade, remote } = configure(null);
    facade.savePredictions({ M1: { home: 1, away: 0 } });
    await vi.advanceTimersByTimeAsync(2000);
    expect(remote.saved.size).toBe(0);
  });

  test('connecté : push distant débouncé en une seule écriture', async () => {
    const { facade, remote } = configure(USER);
    facade.savePredictions({ M1: { home: 1, away: 0 } });
    facade.savePredictions({ M1: { home: 2, away: 0 } });
    expect(remote.saved.size).toBe(0); // débounce : rien avant l'échéance
    await vi.advanceTimersByTimeAsync(1500);
    expect(remote.saved.get('u1')).toEqual({ M1: { home: 2, away: 0 } });
  });

  test('échec réseau : reste « dirty » et retente sur l’évènement online', async () => {
    const { facade, remote } = configure(USER);
    remote.failNextSave = true;
    facade.savePredictions({ M1: { home: 1, away: 0 } });
    await vi.advanceTimersByTimeAsync(1500);
    expect(remote.saved.size).toBe(0); // l'échec a laissé la ligne « dirty »
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(0);
    expect(remote.saved.get('u1')).toEqual({ M1: { home: 1, away: 0 } });
  });
});
