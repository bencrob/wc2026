import { GroupFixture, MatchId } from '../models';
import { GROUPS, TEAMS_BY_GROUP } from './teams';

/**
 * Pattern round-robin d'un groupe de 4 (méthode du cercle).
 * J1 (1-2, 3-4) · J2 (1-3, 4-2) · J3 (4-1, 2-3).
 */
const ROUND_ROBIN_PATTERN: readonly (readonly [number, number])[][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[3, 0], [1, 2]],
];

/** 72 matchs de poule (M1..M72), ids internes séquentiels. */
export const GROUP_FIXTURES: readonly GroupFixture[] = (() => {
  const fixtures: GroupFixture[] = [];
  let n = 1;
  for (const g of GROUPS) {
    const ids = TEAMS_BY_GROUP[g];
    ROUND_ROBIN_PATTERN.forEach((matchday, mdIdx) => {
      for (const [h, a] of matchday) {
        const home = ids[h];
        const away = ids[a];
        if (home === undefined || away === undefined) continue;
        fixtures.push({
          id: 'M' + n,
          groupId: g,
          matchday: mdIdx + 1,
          home,
          away,
        });
        n++;
      }
    });
  }
  return fixtures;
})();

export const GROUP_FIXTURE_IDS: readonly MatchId[] = GROUP_FIXTURES.map(
  (f) => f.id,
);
