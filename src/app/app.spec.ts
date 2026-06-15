import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { App } from './app';
import { TournamentStore } from './application/tournament.store';
import {
  AUTH,
  CLOCK,
  FILE_IO,
  NOTIFICATIONS_STATE,
  OFFICIAL_RESULTS,
  PERSISTENCE,
  PROFILE,
  REMOTE_PREDICTIONS,
  SYNC_PROMPTS,
} from './application/tokens';
import {
  AuthStub,
  ClockStub,
  FileIoSpy,
  NotificationsStateStub,
  OfficialResultsStub,
  PersistenceStub,
  ProfileStub,
  RemotePredictionsStub,
  SyncPromptsStub,
} from './testing/test-doubles';

/** Surface interne du shell exposée aux tests (membres `protected`). */
interface AppInternals {
  onExport(): void;
  onImport(event: Event): Promise<void>;
  onReset(): void;
}

interface Harness {
  app: AppInternals;
  store: TournamentStore;
  fileIo: FileIoSpy;
}

function setup(): Harness {
  const fileIo = new FileIoSpy();
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideAnimationsAsync(),
      provideRouter([]),
      { provide: PERSISTENCE, useValue: new PersistenceStub() },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub() },
      { provide: FILE_IO, useValue: fileIo },
      { provide: CLOCK, useValue: new ClockStub(0) }, // 1970 → avant tout coup d'envoi
      { provide: AUTH, useValue: new AuthStub() },
      { provide: REMOTE_PREDICTIONS, useValue: new RemotePredictionsStub() },
      { provide: PROFILE, useValue: new ProfileStub() },
      { provide: SYNC_PROMPTS, useValue: new SyncPromptsStub() },
      { provide: NOTIFICATIONS_STATE, useValue: new NotificationsStateStub() },
    ],
  });
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  const app = fixture.componentInstance as unknown as AppInternals;
  return { app, store: TestBed.inject(TournamentStore), fileIo };
}

function fileInputEvent(): Event {
  const input = document.createElement('input');
  input.type = 'file';
  Object.defineProperty(input, 'files', { value: [new File(['{}'], 'p.json')] });
  return { target: input } as unknown as Event;
}

describe('App', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('onExport', () => {
    test('télécharge les pronostics via le port fichier', () => {
      const { app, fileIo } = setup();
      app.onExport();
      expect(fileIo.downloads.length).toBe(1);
    });
  });

  describe('onImport', () => {
    test('importe un JSON valide dans le store', async () => {
      const { app, store, fileIo } = setup();
      fileIo.nextText = JSON.stringify({ version: 1, scores: { M1: { home: 1, away: 0 } } });
      await app.onImport(fileInputEvent());
      expect(store.effective()['M1']).toEqual({ home: 1, away: 0 });
    });

    test('ignore un JSON illisible sans modifier le store', async () => {
      const { app, store, fileIo } = setup();
      fileIo.nextText = 'pas du json';
      await app.onImport(fileInputEvent());
      expect(store.effective()['M1']).toBeUndefined();
    });
  });

  describe('onReset', () => {
    test('réinitialise les pronostics après confirmation', () => {
      const { app, store } = setup();
      store.setScore('M1', 'home', 1);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      app.onReset();
      expect(store.effective()['M1']).toBeUndefined();
    });

    test('ne réinitialise rien si l’utilisateur annule', () => {
      const { app, store } = setup();
      store.setScore('M1', 'home', 1);
      store.setScore('M1', 'away', 0);
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      app.onReset();
      expect(store.effective()['M1']).toEqual({ home: 1, away: 0 });
    });
  });
});
