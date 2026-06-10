import { describe, expect, it } from 'vitest';
import { GROUP_FIXTURES } from '../data/fixtures';
import { KO_MATCH_IDS } from '../data/knockout-structure';
import { Score, ScoreMap } from '../models';
import { TournamentEngine } from './tournament.engine';

const engine = new TournamentEngine();
const suffix = (teamId: string): number => Number(teamId.slice(1));

/** Poules complètes : dans chaque match, l'équipe au suffixe le plus bas gagne 1-0. */
function fullGroupScores(): Record<string, Score> {
  const m: Record<string, Score> = {};
  for (const f of GROUP_FIXTURES) {
    m[f.id] =
      suffix(f.home) < suffix(f.away)
        ? { home: 1, away: 0 }
        : { home: 0, away: 1 };
  }
  return m;
}

function withAllKnockout(base: Record<string, Score>): Record<string, Score> {
  const m = { ...base };
  for (const id of KO_MATCH_IDS) m[id] = { home: 1, away: 0 };
  return m;
}

describe('TournamentEngine.recompute — précédence officiel/prono', () => {
  it("l'officiel écrase le prono dans le classement", () => {
    const predictions: ScoreMap = { M1: { home: 2, away: 0 } }; // A1 bat A2
    const official: ScoreMap = { M1: { home: 0, away: 3 } }; // A2 bat A1
    const rt = engine.recompute(predictions, official);
    const a1 = rt.groups.A.standings.find((r) => r.teamId === 'A1')!;
    const a2 = rt.groups.A.standings.find((r) => r.teamId === 'A2')!;
    expect(a2.points).toBe(3);
    expect(a1.points).toBe(0);
    expect(rt.effective['M1']).toEqual({ home: 0, away: 3 });
  });

  it('calcule la comparaison et le résumé agrégé', () => {
    const predictions: ScoreMap = {
      M1: { home: 2, away: 1 },
      M2: { home: 1, away: 0 },
      M3: { home: 0, away: 0 },
    };
    const official: ScoreMap = {
      M1: { home: 2, away: 1 }, // exact
      M2: { home: 3, away: 1 }, // outcome
      M3: { home: 1, away: 2 }, // wrong
      M4: { home: 1, away: 0 }, // sans prono
    };
    const rt = engine.recompute(predictions, official);
    expect(rt.comparisonSummary).toEqual({
      official: 4,
      exact: 1,
      outcome: 1,
      wrong: 1,
      noPrediction: 1,
    });
    expect(rt.comparison['M1']!.verdict).toBe('exact');
    expect(rt.comparison['M4']!.prediction).toBeNull();
  });

  it('compte la progression sur les scores effectifs', () => {
    const rt = engine.recompute({ M1: { home: 1, away: 0 } }, { M2: { home: 0, away: 0 } });
    expect(rt.progress.groupsDone).toBe(2);
    expect(rt.progress.total).toBe(2);
  });
});

describe('TournamentEngine.recompute — simulation bout-en-bout', () => {
  it('qualifie 24 + 8 et propage jusqu’au champion', () => {
    const rt = engine.recompute(withAllKnockout(fullGroupScores()));

    // Tous les groupes complets, 1ers = G1, 2es = G2
    expect(Object.values(rt.groups).every((g) => g.complete)).toBe(true);
    expect(rt.qualifiers.winners.A).toBe('A1');
    expect(rt.qualifiers.runnersUp.A).toBe('A2');

    // 3es résolus : les 8 meilleurs (égalité → alphabétique) = A3..H3
    expect(rt.thirdResolved).toBe(true);
    expect([...rt.qualifiers.bestThirds].sort()).toEqual([
      'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3',
    ]);

    // Affectation valide des 8 créneaux
    expect(Object.keys(rt.thirdPlaceAssignment).length).toBe(8);

    // Finale décidée, champion désigné, 3e place alimentée
    expect(rt.knockout['M104']!.decided).toBe(true);
    expect(rt.knockout['M104']!.winner).not.toBeNull();
    expect(rt.knockout['M103']!.decided).toBe(true);
    expect(rt.progress.total).toBe(104);
    expect(rt.progress.pct).toBe(100);
  });
});
