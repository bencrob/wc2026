import { describe, expect, it } from 'vitest';
import { THIRD_PLACE_SLOTS } from '../data/knockout-structure';
import { GROUPS } from '../data/teams';
import { GroupId, GroupResult, ScoreMap } from '../models';
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
      combo.push(arr[i]!);
      rec(i + 1, combo);
      combo.pop();
    }
  };
  rec(0, []);
  return res;
}

describe('GroupStageEngine.computeGroupStandings', () => {
  it('classe un groupe complet par points puis diff/buts', () => {
    const scores: ScoreMap = {
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
    expect(standings[0]!.rank).toBe(1);
  });

  it('marque le groupe incomplet tant que les 6 matchs ne sont pas saisis', () => {
    const { complete } = engine.computeGroupStandings('A', {
      M1: { home: 1, away: 0 },
    });
    expect(complete).toBe(false);
  });

  it('départage de façon déterministe (alphabétique) et signale les égalités', () => {
    // Tout 0-0 : 4 équipes à 3 pts, diff 0, buts 0 → ordre alphabétique A1<A2<A3<A4.
    const scores: ScoreMap = {
      M1: { home: 0, away: 0 },
      M2: { home: 0, away: 0 },
      M3: { home: 0, away: 0 },
      M4: { home: 0, away: 0 },
      M5: { home: 0, away: 0 },
      M6: { home: 0, away: 0 },
    };
    const { standings, tiedRanks } = engine.computeGroupStandings('A', scores);
    expect(standings.map((r) => r.teamId)).toEqual(['A1', 'A2', 'A3', 'A4']);
    expect(tiedRanks.size).toBe(4); // tous égaux → tous signalés
  });
});

describe('GroupStageEngine.assignThirdPlaceSlots — backtracking', () => {
  const slotKeys = Object.keys(THIRD_PLACE_SLOTS);

  it('produit une affectation valide pour LES 495 combinaisons de 8 groupes', () => {
    const combos = combinations(GROUPS, 8);
    expect(combos.length).toBe(495);

    for (const qualified of combos) {
      const assignment = engine.assignThirdPlaceSlots(qualified);
      expect(assignment, `combo ${qualified.join('')}`).not.toBeNull();

      const keys = Object.keys(assignment!);
      const values = Object.values(assignment!);
      // 8 créneaux exactement, groupes tous distincts
      expect(keys.sort()).toEqual([...slotKeys].sort());
      expect(new Set(values).size).toBe(8);
      // chaque groupe affecté est éligible pour son créneau
      for (const slot of keys) {
        expect(THIRD_PLACE_SLOTS[slot]).toContain(assignment![slot]);
      }
      // l'ensemble des groupes affectés = les 8 qualifiés
      expect(new Set(values)).toEqual(new Set(qualified));
    }
  });

  it('est déterministe (même entrée → même sortie)', () => {
    const a = engine.assignThirdPlaceSlots(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    const b = engine.assignThirdPlaceSlots(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(a).toEqual(b);
  });

  it('gère les arêtes K et L (un seul créneau éligible chacun)', () => {
    // K éligible seulement en M80, L seulement en M87.
    const assignment = engine.assignThirdPlaceSlots([
      'A', 'B', 'C', 'D', 'E', 'K', 'L', 'I',
    ]);
    expect(assignment).not.toBeNull();
    expect(assignment!['M80']).toBe('K');
    expect(assignment!['M87']).toBe('L');
  });
});

describe('GroupStageEngine.rankThirdPlaced', () => {
  it("n'est résolu que lorsque les 12 groupes sont complets", () => {
    const incomplete = {} as Record<GroupId, GroupResult>;
    for (const g of GROUPS) {
      incomplete[g] = engine.computeGroupStandings(g, {});
    }
    const ranking = engine.rankThirdPlaced(incomplete);
    expect(ranking.resolved).toBe(false);
    expect(ranking.ranking.every((t) => !t.qualified)).toBe(true);
  });
});
