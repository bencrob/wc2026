import { describe, expect, test } from 'vitest';
import { ScoreMap } from '../../src/app/domain/models';
import { computeLeaderboard } from './compute-leaderboard';

const official: ScoreMap = { M1: { home: 2, away: 1 } };

describe('computeLeaderboard', () => {
  test('barème : 3 pts par score exact, 1 pt par bon résultat', () => {
    const rows = computeLeaderboard(
      [
        { userId: 'u1', pseudo: 'Exact', scores: { M1: { home: 2, away: 1 } } },
        { userId: 'u2', pseudo: 'BonResultat', scores: { M1: { home: 1, away: 0 } } },
        { userId: 'u3', pseudo: 'Rate', scores: { M1: { home: 0, away: 3 } } },
      ],
      official,
    );
    expect(rows.map((r) => [r.pseudo, r.points, r.exact, r.outcome])).toEqual([
      ['Exact', 3, 1, 0],
      ['BonResultat', 1, 0, 1],
      ['Rate', 0, 0, 0],
    ]);
  });

  test('trie par points décroissants', () => {
    const rows = computeLeaderboard(
      [
        { userId: 'u2', pseudo: 'B', scores: { M1: { home: 1, away: 0 } } },
        { userId: 'u1', pseudo: 'A', scores: { M1: { home: 2, away: 1 } } },
      ],
      official,
    );
    expect(rows.map((r) => r.pseudo)).toEqual(['A', 'B']);
  });

  test('liste vide → classement vide', () => {
    expect(computeLeaderboard([], official)).toEqual([]);
  });
});
