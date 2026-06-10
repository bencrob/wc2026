import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TournamentStore } from '../../../application/tournament.store';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import { GROUP_FIXTURES } from '../../../domain/data/fixtures';
import { KO_MATCH_IDS, KO_PHASES } from '../../../domain/data/knockout-structure';
import { Score } from '../../../domain/models';
import {
  InMemoryPersistence,
  NoopFileIo,
  StaticOfficialResultsProvider,
} from '../../../testing/test-doubles';
import { KnockoutComponent } from './knockout.component';

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

function setup() {
  TestBed.configureTestingModule({
    imports: [KnockoutComponent],
    providers: [
      { provide: PERSISTENCE, useValue: new InMemoryPersistence() },
      { provide: OFFICIAL_RESULTS, useValue: new StaticOfficialResultsProvider() },
      { provide: FILE_IO, useValue: new NoopFileIo() },
    ],
  });
  const store = TestBed.inject(TournamentStore);
  const fixture = TestBed.createComponent(KnockoutComponent);
  fixture.detectChanges();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { store, fixture, comp: fixture.componentInstance as any };
}

const phase = (key: string) => KO_PHASES.find((p) => p.key === key)!;

describe('KnockoutComponent — arbre', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('ordonne les 16es selon l’arbre (qualifiés adjacents)', () => {
    const { comp } = setup();
    expect(comp.orderedIds(phase('R32')).slice(0, 4)).toEqual(['M74', 'M77', 'M73', 'M75']);
  });

  it('ordonne les 8es selon l’arbre', () => {
    const { comp } = setup();
    expect(comp.orderedIds(phase('R16'))).toEqual([
      'M89', 'M90', 'M93', 'M94', 'M91', 'M92', 'M95', 'M96',
    ]);
  });

  it('exclut la petite finale (M103) des colonnes de l’arbre', () => {
    const { comp } = setup();
    expect(comp.bracketPhases.some((p: { key: string }) => p.key === 'P3')).toBe(false);
    expect(comp.thirdPlaceId).toBe('M103');
  });

  it('affiche le champion une fois la finale décidée', () => {
    const { store, fixture, comp } = setup();
    expect(comp.champion()).toBeNull();

    const res = store.importPredictions({ version: 1, scores: fullScores() });
    expect(res.ok).toBe(true);
    fixture.detectChanges();

    expect(comp.champion()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.champion-banner')).toBeTruthy();
  });
});
