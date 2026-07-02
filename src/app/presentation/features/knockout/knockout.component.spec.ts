import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { TournamentStore } from '../../../application/tournament.store';
import { CLOCK, FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import { GROUP_FIXTURES } from '../../../domain/data/fixtures';
import { KO_MATCH_IDS } from '../../../domain/data/knockout-structure';
import { MatchId, Score, Side } from '../../../domain/models';
import { required } from '../../../domain/util/required';
import { ClockStub, FileIoSpy, OfficialResultsStub, PersistenceStub } from '../../../testing/test-doubles';
import { KnockoutComponent } from './knockout.component';

interface RoundVm {
  key: string;
  label: string;
  matches: { id: MatchId }[];
}
interface BracketVm {
  rounds: RoundVm[];
  thirdPlace: { id: MatchId };
  champion: string | null;
  runnerUp: string | null;
}
interface KnockoutInternals {
  bracketVm(): BracketVm;
  set(id: MatchId, side: Side, value: number | null): void;
  pickWinner(id: MatchId, side: Side): void;
}

const suffix = (teamId: string): number => Number(teamId.slice(1));

/** Tournoi complet : poules (suffixe bas gagne) + tous les KO en 1-0 domicile. */
function fullScores(): Record<string, Score> {
  const m: Record<string, Score> = {};
  for (const f of GROUP_FIXTURES) {
    m[f.id] = suffix(f.home) < suffix(f.away) ? { home: 1, away: 0 } : { home: 0, away: 1 };
  }
  for (const id of KO_MATCH_IDS) m[id] = { home: 1, away: 0 };
  return m;
}

interface Harness {
  store: TournamentStore;
  fixture: ComponentFixture<KnockoutComponent>;
  comp: KnockoutInternals;
}

function setup(): Harness {
  TestBed.configureTestingModule({
    imports: [KnockoutComponent],
    providers: [
      { provide: PERSISTENCE, useValue: new PersistenceStub() },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub() },
      { provide: FILE_IO, useValue: new FileIoSpy() },
      { provide: CLOCK, useValue: new ClockStub(0) }, // 1970 → avant tout coup d'envoi (tests déterministes)
    ],
  });
  const store = TestBed.inject(TournamentStore);
  const fixture = TestBed.createComponent(KnockoutComponent);
  fixture.detectChanges();
  return { store, fixture, comp: fixture.componentInstance as unknown as KnockoutInternals };
}

const idsOf = (vm: BracketVm, key: string): MatchId[] =>
  required(
    vm.rounds.find((r) => r.key === key),
    `tour ${key}`,
  ).matches.map((m) => m.id);

describe('KnockoutComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('bracketVm', () => {
    test('ordonne les 16es selon l’arbre (qualifiés adjacents)', () => {
      const { comp } = setup();
      expect(idsOf(comp.bracketVm(), 'R32').slice(0, 4)).toEqual(['M74', 'M77', 'M73', 'M75']);
    });

    test('ordonne les 8es selon l’arbre', () => {
      const { comp } = setup();
      expect(idsOf(comp.bracketVm(), 'R16')).toEqual([
        'M89', 'M90', 'M93', 'M94', 'M91', 'M92', 'M95', 'M96',
      ]);
    });

    test('exclut la petite finale (M103) des colonnes et l’expose à part', () => {
      const { comp } = setup();
      const vm = comp.bracketVm();
      expect(vm.rounds.some((r) => r.key === 'P3')).toBe(false);
      expect(vm.thirdPlace.id).toBe('M103');
    });

    test('expose le champion une fois la finale décidée', () => {
      const { store, fixture, comp } = setup();
      expect(comp.bracketVm().champion).toBeNull();

      expect(store.importPredictions({ version: 1, scores: fullScores() }).ok).toBe(true);
      fixture.detectChanges();

      expect(comp.bracketVm().champion).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.champion-banner')).toBeTruthy();
    });
  });

  describe('set', () => {
    test('reporte la saisie dans le store', () => {
      const { store, comp } = setup();
      comp.set('M73', 'home', 2);
      expect(store.effective()['M73']).toEqual({ home: 2 });
    });
  });

  describe('pickWinner', () => {
    test('désigne le vainqueur aux tirs au but sur un nul KO', () => {
      const { store, comp } = setup();
      comp.set('M73', 'home', 1);
      comp.set('M73', 'away', 1);
      comp.pickWinner('M73', 'home');
      expect(store.effective()['M73']).toEqual({ home: 1, away: 1, winner: 'home' });
    });
  });
});
