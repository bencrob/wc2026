import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { DraftScoreMap } from '../domain/models';
import { AuthUser } from '../domain/ports/auth.port';
import {
  AuthStub,
  ClockStub,
  FileIoSpy,
  OfficialResultsStub,
  PersistenceStub,
  ProfileStub,
  RemotePredictionsStub,
  SyncPromptsStub,
} from '../testing/test-doubles';
import { AccountSyncService } from './account-sync.service';
import {
  AUTH,
  CLOCK,
  FILE_IO,
  OFFICIAL_RESULTS,
  PERSISTENCE,
  PROFILE,
  REMOTE_PREDICTIONS,
  SYNC_PROMPTS,
} from './tokens';
import { TournamentStore } from './tournament.store';

const USER: AuthUser = { id: 'u1', email: 'alice@example.com' };
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

interface Options {
  local?: DraftScoreMap;
  remote?: Record<string, DraftScoreMap>;
}

interface Harness {
  service: AccountSyncService;
  store: TournamentStore;
  auth: AuthStub;
  remote: RemotePredictionsStub;
  profile: ProfileStub;
  prompts: SyncPromptsStub;
}

function configure(opts: Options = {}): Harness {
  const auth = new AuthStub();
  const remote = new RemotePredictionsStub(opts.remote ?? {});
  const profile = new ProfileStub();
  const prompts = new SyncPromptsStub();
  TestBed.configureTestingModule({
    providers: [
      { provide: PERSISTENCE, useValue: new PersistenceStub(opts.local ?? {}) },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub() },
      { provide: FILE_IO, useValue: new FileIoSpy() },
      { provide: CLOCK, useValue: new ClockStub(0) },
      { provide: AUTH, useValue: auth },
      { provide: REMOTE_PREDICTIONS, useValue: remote },
      { provide: PROFILE, useValue: profile },
      { provide: SYNC_PROMPTS, useValue: prompts },
    ],
  });
  return {
    service: TestBed.inject(AccountSyncService),
    store: TestBed.inject(TournamentStore),
    auth,
    remote,
    profile,
    prompts,
  };
}

async function login(h: Harness): Promise<void> {
  h.service.start();
  h.auth.set(USER);
  await tick();
  await tick();
}

describe('AccountSyncService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  test('migration : importe les pronostics locaux quand le compte est vide', async () => {
    const h = configure({ local: { M1: { home: 1, away: 0 } } });
    h.prompts.importAnswer = true;
    await login(h);
    expect(h.remote.saved.get('u1')).toEqual({ M1: { home: 1, away: 0 } });
  });

  test('migration refusée : rien n’est envoyé au compte', async () => {
    const h = configure({ local: { M1: { home: 1, away: 0 } } });
    h.prompts.importAnswer = false;
    await login(h);
    expect(h.remote.saved.has('u1')).toBe(false);
  });

  test('hydratation : charge les pronostics du compte quand le local est vide', async () => {
    const h = configure({ remote: { u1: { M2: { home: 1, away: 0 } } } });
    await login(h);
    expect(h.store.predictions()).toEqual({ M2: { home: 1, away: 0 } });
  });

  test('conflit → garder le cloud : l’état prend les pronostics distants', async () => {
    const h = configure({
      local: { M1: { home: 3, away: 3 } },
      remote: { u1: { M2: { home: 1, away: 0 } } },
    });
    h.prompts.conflictAnswer = 'remote';
    await login(h);
    expect(h.store.predictions()).toEqual({ M2: { home: 1, away: 0 } });
  });

  test('conflit → garder l’appareil : écrase le compte avec le local', async () => {
    const h = configure({
      local: { M1: { home: 3, away: 3 } },
      remote: { u1: { M2: { home: 1, away: 0 } } },
    });
    h.prompts.conflictAnswer = 'local';
    await login(h);
    expect(h.remote.saved.get('u1')).toEqual({ M1: { home: 3, away: 3 } });
  });

  test('choix du pseudo : réessaie tant que le pseudo est pris', async () => {
    const h = configure({ remote: { u1: { M2: { home: 1, away: 0 } } } });
    await h.profile.setPseudo('autre', 'pris'); // déjà utilisé par un autre compte
    h.prompts.pseudoAnswers = ['pris', 'libre'];
    await login(h);
    expect(h.service.pseudo()).toBe('libre');
  });

  test('déconnexion : réinitialise pseudo et autorise un nouveau flux', async () => {
    const h = configure({ remote: { u1: { M2: { home: 1, away: 0 } } } });
    await login(h);
    h.auth.set(null);
    await tick();
    expect(h.service.user()).toBeNull();
    expect(h.service.pseudo()).toBeNull();
  });
});
