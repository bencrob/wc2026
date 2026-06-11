import { describe, expect, test } from 'vitest';
import { FifaRankPipe } from './fifa-rank.pipe';

const pipe = new FifaRankPipe();

describe('FifaRankPipe', () => {
  describe('transform', () => {
    test('renvoie un rang entier positif pour un id connu', () => {
      const rank = pipe.transform('A1');
      expect(rank).not.toBeNull();
      expect(Number.isInteger(rank) && (rank ?? 0) > 0).toBe(true);
    });

    test('renvoie null pour un id absent', () => {
      expect(pipe.transform(null)).toBeNull();
      expect(pipe.transform(undefined)).toBeNull();
    });
  });
});
