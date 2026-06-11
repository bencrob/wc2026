import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { TournamentStore } from '../../../application/tournament.store';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import { GROUP_FIXTURES } from '../../../domain/data/fixtures';
import { Score } from '../../../domain/models';
import { FileIoSpy, OfficialResultsStub, PersistenceStub } from '../../../testing/test-doubles';
import { ThirdsComponent } from './thirds.component';

interface Row {
  qualified: boolean;
  cut: boolean;
}
interface ThirdsVm {
  provisional: boolean;
  completeCount: number;
  rows: Row[];
}
interface ThirdsInternals {
  vm(): ThirdsVm;
}

const suffix = (teamId: string): number => Number(teamId.slice(1));

/** Poules complètes : l'équipe au suffixe le plus bas gagne 1-0. */
function fullGroupScores(): Record<string, Score> {
  const m: Record<string, Score> = {};
  for (const f of GROUP_FIXTURES) {
    m[f.id] = suffix(f.home) < suffix(f.away) ? { home: 1, away: 0 } : { home: 0, away: 1 };
  }
  return m;
}

interface Harness {
  store: TournamentStore;
  fixture: ComponentFixture<ThirdsComponent>;
  comp: ThirdsInternals;
}

function setup(): Harness {
  TestBed.configureTestingModule({
    imports: [ThirdsComponent],
    providers: [
      { provide: PERSISTENCE, useValue: new PersistenceStub() },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub() },
      { provide: FILE_IO, useValue: new FileIoSpy() },
    ],
  });
  const store = TestBed.inject(TournamentStore);
  const fixture = TestBed.createComponent(ThirdsComponent);
  fixture.detectChanges();
  return { store, fixture, comp: fixture.componentInstance as unknown as ThirdsInternals };
}

describe('ThirdsComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('vm', () => {
    test('provisoire tant que les groupes ne sont pas complets', () => {
      const { comp } = setup();
      const vm = comp.vm();
      expect(vm.provisional).toBe(true);
      expect(vm.completeCount).toBe(0);
      expect(vm.rows.length).toBe(12);
      expect(vm.rows.every((r) => !r.qualified)).toBe(true);
    });

    test('résout 8 qualifiés et marque la coupure une fois les 12 groupes complets', () => {
      const { store, fixture, comp } = setup();
      expect(store.importPredictions({ version: 1, scores: fullGroupScores() }).ok).toBe(true);
      fixture.detectChanges();

      const vm = comp.vm();
      expect(vm.provisional).toBe(false);
      expect(vm.completeCount).toBe(12);
      expect(vm.rows.filter((r) => r.qualified).length).toBe(8);
      expect(vm.rows.filter((r) => r.cut).length).toBe(1);
    });
  });
});
