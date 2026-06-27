import { describe, expect, test } from 'vitest';
import { THIRD_PLACE_SLOTS } from '../data/knockout-structure';
import { THIRD_PLACE_ALLOCATION } from '../data/third-place-allocation';
import { GROUPS } from '../data/teams';
import { DraftScoreMap, GroupId, GroupResult } from '../models';
import { GroupStageEngine } from './group-stage.engine';

const engine = new GroupStageEngine();

/** Toutes les combinaisons de k éléments parmi arr. */
function combinations<T>(arr: readonly T[], k: number): T[][] {
  const res: T[][] = [];
  const rec = (start: number, combo: T[]): void => {
    if (combo.length === k) {
      res.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      const item = arr[i];
      if (item === undefined) continue;
      combo.push(item);
      rec(i + 1, combo);
      combo.pop();
    }
  };
  rec(0, []);
  return res;
}

function emptyResults(): Map<GroupId, GroupResult> {
  return new Map(GROUPS.map((g) => [g, engine.computeGroupStandings(g, {})]));
}

describe('GroupStageEngine', () => {
  describe('computeGroupStandings', () => {
    test('classe un groupe complet par points puis diff/buts', () => {
      const scores: DraftScoreMap = {
        M1: { home: 2, away: 0 }, // A1 v A2
        M2: { home: 1, away: 1 }, // A3 v A4
        M3: { home: 1, away: 0 }, // A1 v A3
        M4: { home: 0, away: 3 }, // A4 v A2
        M5: { home: 0, away: 1 }, // A4 v A1
        M6: { home: 2, away: 2 }, // A2 v A3
      };
      const { standings, complete } = engine.computeGroupStandings('A', scores);
      expect(complete).toBe(true);
      expect(standings.map((r) => r.teamId)).toEqual(['A1', 'A2', 'A3', 'A4']);
      expect(standings.map((r) => r.points)).toEqual([9, 4, 2, 1]);
    });

    test('marque le groupe incomplet tant que les 6 matchs ne sont pas saisis', () => {
      expect(engine.computeGroupStandings('A', { M1: { home: 1, away: 0 } }).complete).toBe(false);
    });

    test('départage de façon déterministe (alphabétique) et signale les égalités', () => {
      const scores: DraftScoreMap = {
        M1: { home: 0, away: 0 },
        M2: { home: 0, away: 0 },
        M3: { home: 0, away: 0 },
        M4: { home: 0, away: 0 },
        M5: { home: 0, away: 0 },
        M6: { home: 0, away: 0 },
      };
      const { standings, tiedRanks } = engine.computeGroupStandings('A', scores);
      expect(standings.map((r) => r.teamId)).toEqual(['A1', 'A2', 'A3', 'A4']);
      expect(tiedRanks.size).toBe(4);
    });
  });

  describe('rankThirdPlaced', () => {
    test("n'est résolu que lorsque les 12 groupes sont complets", () => {
      const ranking = engine.rankThirdPlaced(emptyResults());
      expect(ranking.resolved).toBe(false);
      expect(ranking.ranking.every((t) => !t.qualified)).toBe(true);
    });
  });

  describe('assignThirdPlaceSlots', () => {
    const slotKeys = Object.keys(THIRD_PLACE_SLOTS);

    test('produit une affectation valide pour LES 495 combinaisons de 8 groupes', () => {
      const combos = combinations(GROUPS, 8);
      expect(combos.length).toBe(495);

      for (const qualified of combos) {
        const assignment = engine.assignThirdPlaceSlots(qualified);
        expect(assignment, `combo ${qualified.join('')}`).not.toBeNull();
        if (!assignment) continue;
        const keys = Object.keys(assignment);
        const values = Object.values(assignment);
        expect(keys.sort()).toEqual([...slotKeys].sort());
        expect(new Set(values).size).toBe(8);
        for (const slot of keys) {
          expect(THIRD_PLACE_SLOTS[slot]).toContain(assignment[slot]);
        }
        expect(new Set(values)).toEqual(new Set(qualified));
        // conforme à la table officielle FIFA (Annexe C), pas seulement « valide »
        expect(assignment).toEqual(THIRD_PLACE_ALLOCATION[[...qualified].sort().join('')]);
      }
    });

    test('est déterministe (même entrée → même sortie)', () => {
      const groups: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      expect(engine.assignThirdPlaceSlots(groups)).toEqual(engine.assignThirdPlaceSlots(groups));
    });

    test('gère les arêtes K et L (un seul créneau éligible chacun)', () => {
      const assignment = engine.assignThirdPlaceSlots(['A', 'B', 'C', 'D', 'E', 'K', 'L', 'I']);
      expect(assignment?.['M80']).toBe('K');
      expect(assignment?.['M87']).toBe('L');
    });

    test('place le 3e au créneau OFFICIEL FIFA, pas une affectation arbitraire valide', () => {
      // Régression : D et F sont tous deux éligibles à M77. La table officielle
      // (Annexe C) y place le 3e du groupe F — p.ex. France (I1) vs Suède (3e du F) —
      // et non celui du groupe D (p.ex. Paraguay), que l'ancien backtracking choisissait.
      const a = engine.assignThirdPlaceSlots(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
      expect(a?.['M77']).toBe('F');
    });
  });
});
