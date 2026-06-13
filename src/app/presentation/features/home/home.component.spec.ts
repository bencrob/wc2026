import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { CLOCK, FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import {
  ClockStub,
  FileIoSpy,
  OfficialResultsStub,
  PersistenceStub,
} from '../../../testing/test-doubles';
import { HomeComponent } from './home.component';

/** Surface interne exposée aux tests (membres `protected`). */
interface HomeInternals {
  selected(): number;
  goRelative(delta: number): void;
}

function setup(): HomeInternals {
  TestBed.configureTestingModule({
    providers: [
      { provide: PERSISTENCE, useValue: new PersistenceStub() },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub() },
      { provide: FILE_IO, useValue: new FileIoSpy() },
      { provide: CLOCK, useValue: new ClockStub(0) },
    ],
  });
  // Pas de detectChanges : on teste la logique sans monter les onglets enfants.
  const fixture = TestBed.createComponent(HomeComponent);
  return fixture.componentInstance as unknown as HomeInternals;
}

describe('HomeComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('goRelative', () => {
    test('borne la sélection dans [0, 2]', () => {
      const home = setup();
      home.goRelative(-1);
      expect(home.selected()).toBe(0);
      home.goRelative(1);
      home.goRelative(1);
      home.goRelative(1);
      expect(home.selected()).toBe(2);
    });
  });
});
