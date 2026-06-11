import { describe, expect, test } from 'vitest';
import { GROUP_FIXTURES } from '../data/fixtures';
import { KO_MATCH_IDS } from '../data/knockout-structure';
import { DraftScore, DraftScoreMap, ScoreMap } from '../models';
import { required } from '../util/required';
import { TournamentEngine } from './tournament.engine';

const engine = new TournamentEngine();
const suffix = (teamId: string): number => Number(teamId.slice(1));

/** Poules complètes : dans chaque match, l'équipe au suffixe le plus bas gagne 1-0. */
function fullGroupScores(): Record<string, DraftScore> {
  const m: Record<string, DraftScore> = {};
  for (const f of GROUP_FIXTURES) {
    m[f.id] = suffix(f.home) < suffix(f.away) ? { home: 1, away: 0 } : { home: 0, away: 1 };
  }
  return m;
}

function withAllKnockout(base: Record<string, DraftScore>): DraftScoreMap {
  const m = { ...base };
  for (const id of KO_MATCH_IDS) m[id] = { home: 1, away: 0 };
  return m;
}

describe('TournamentEngine', () => {
  describe('recompute — précédence officiel/prono', () => {
    test("l'officiel écrase le prono dans le classement", () => {
      const predictions: DraftScoreMap = { M1: { home: 2, away: 0 } };
      const official: ScoreMap = { M1: { home: 0, away: 3 } };
      const rt = engine.recompute(predictions, official);
      const groupA = required(rt.groups.get('A'), 'groupe A');
      const a1 = required(
        groupA.standings.find((r) => r.teamId === 'A1'),
        'A1',
      );
      const a2 = required(
        groupA.standings.find((r) => r.teamId === 'A2'),
        'A2',
      );
      expect(a2.points).toBe(3);
      expect(a1.points).toBe(0);
      expect(rt.effective['M1']).toEqual({ home: 0, away: 3 });
    });

    test('calcule la comparaison et le résumé agrégé', () => {
      const predictions: DraftScoreMap = {
        M1: { home: 2, away: 1 },
        M2: { home: 1, away: 0 },
        M3: { home: 0, away: 0 },
      };
      const official: ScoreMap = {
        M1: { home: 2, away: 1 },
        M2: { home: 3, away: 1 },
        M3: { home: 1, away: 2 },
        M4: { home: 1, away: 0 },
      };
      const rt = engine.recompute(predictions, official);
      expect(rt.comparisonSummary).toEqual({
        official: 4,
        exact: 1,
        outcome: 1,
        wrong: 1,
        noPrediction: 1,
      });
      expect(rt.comparison['M1']?.verdict).toBe('exact');
      expect(rt.comparison['M4']?.prediction).toBeNull();
    });

    test('compte la progression sur les scores effectifs', () => {
      const rt = engine.recompute({ M1: { home: 1, away: 0 } }, { M2: { home: 0, away: 0 } });
      expect(rt.progress.groupsDone).toBe(2);
      expect(rt.progress.total).toBe(2);
    });
  });

  describe('recompute — simulation bout-en-bout', () => {
    test('qualifie 24 + 8 et propage jusqu’au champion', () => {
      const rt = engine.recompute(withAllKnockout(fullGroupScores()));

      expect([...rt.groups.values()].every((g) => g.complete)).toBe(true);
      expect(rt.qualifiers.winners.A).toBe('A1');
      expect(rt.qualifiers.runnersUp.A).toBe('A2');

      expect(rt.thirdResolved).toBe(true);
      expect([...rt.qualifiers.bestThirds].sort()).toEqual([
        'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3',
      ]);
      expect(Object.keys(rt.thirdPlaceAssignment).length).toBe(8);

      expect(rt.knockout['M104']?.decided).toBe(true);
      expect(rt.knockout['M104']?.winner).not.toBeNull();
      expect(rt.knockout['M103']?.decided).toBe(true);
      expect(rt.progress.total).toBe(104);
      expect(rt.progress.pct).toBe(100);
    });
  });
});
