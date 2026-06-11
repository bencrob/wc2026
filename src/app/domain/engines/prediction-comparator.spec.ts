import { describe, expect, test } from 'vitest';
import { PredictionComparator } from './prediction-comparator';

const cmp = new PredictionComparator();

describe('PredictionComparator', () => {
  describe('verdict', () => {
    test('renvoie null sans pronostic complet', () => {
      expect(cmp.verdict(undefined, { home: 1, away: 0 }, false)).toBeNull();
      expect(cmp.verdict({ home: 1 }, { home: 1, away: 0 }, false)).toBeNull();
    });

    test('poule : score identique → exact', () => {
      expect(cmp.verdict({ home: 2, away: 1 }, { home: 2, away: 1 }, false)).toBe('exact');
    });

    test('poule : bon vainqueur mais score différent → outcome', () => {
      expect(cmp.verdict({ home: 1, away: 0 }, { home: 3, away: 0 }, false)).toBe('outcome');
    });

    test('poule : bon nul (score différent) → outcome', () => {
      expect(cmp.verdict({ home: 1, away: 1 }, { home: 2, away: 2 }, false)).toBe('outcome');
    });

    test('poule : mauvais résultat → wrong', () => {
      expect(cmp.verdict({ home: 2, away: 0 }, { home: 0, away: 3 }, false)).toBe('wrong');
    });

    test('KO : nul même score même qualifié (TAB) → exact', () => {
      expect(
        cmp.verdict({ home: 1, away: 1, winner: 'away' }, { home: 1, away: 1, winner: 'away' }, true),
      ).toBe('exact');
    });

    test('KO : nul même score mais qualifié TAB différent → wrong', () => {
      expect(
        cmp.verdict({ home: 1, away: 1, winner: 'home' }, { home: 1, away: 1, winner: 'away' }, true),
      ).toBe('wrong');
    });

    test('KO : bon qualifié, score différent → outcome', () => {
      expect(cmp.verdict({ home: 2, away: 1 }, { home: 3, away: 0 }, true)).toBe('outcome');
    });
  });
});
