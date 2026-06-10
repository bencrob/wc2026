import { describe, expect, it } from 'vitest';
import { PredictionComparator } from './prediction-comparator';

const cmp = new PredictionComparator();

describe('PredictionComparator.verdict', () => {
  it('renvoie null sans pronostic complet', () => {
    expect(cmp.verdict(undefined, { home: 1, away: 0 }, false)).toBeNull();
    expect(cmp.verdict({ home: 1 } as never, { home: 1, away: 0 }, false)).toBeNull();
  });

  it('poule : score identique → exact', () => {
    expect(cmp.verdict({ home: 2, away: 1 }, { home: 2, away: 1 }, false)).toBe('exact');
  });

  it('poule : bon vainqueur mais score différent → outcome', () => {
    expect(cmp.verdict({ home: 1, away: 0 }, { home: 3, away: 0 }, false)).toBe('outcome');
  });

  it('poule : bon nul (score différent) → outcome', () => {
    expect(cmp.verdict({ home: 1, away: 1 }, { home: 2, away: 2 }, false)).toBe('outcome');
  });

  it('poule : mauvais résultat → wrong', () => {
    expect(cmp.verdict({ home: 2, away: 0 }, { home: 0, away: 3 }, false)).toBe('wrong');
  });

  it('KO : nul même score même qualifié (TAB) → exact', () => {
    expect(
      cmp.verdict(
        { home: 1, away: 1, winner: 'away' },
        { home: 1, away: 1, winner: 'away' },
        true,
      ),
    ).toBe('exact');
  });

  it('KO : nul même score mais qualifié TAB différent → wrong', () => {
    expect(
      cmp.verdict(
        { home: 1, away: 1, winner: 'home' },
        { home: 1, away: 1, winner: 'away' },
        true,
      ),
    ).toBe('wrong');
  });

  it('KO : bon qualifié, score différent → outcome', () => {
    expect(cmp.verdict({ home: 2, away: 1 }, { home: 3, away: 0 }, true)).toBe('outcome');
  });
});
