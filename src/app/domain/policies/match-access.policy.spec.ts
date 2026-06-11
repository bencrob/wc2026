import { describe, expect, test } from 'vitest';
import { ScoreMap } from '../models';
import { MatchAccessPolicy } from './match-access.policy';

const policy = new MatchAccessPolicy();
const official: ScoreMap = { M1: { home: 2, away: 1 } };

describe('MatchAccessPolicy', () => {
  describe('isEditable', () => {
    test('faux pour un match ayant un résultat officiel', () => {
      expect(policy.isEditable('M1', official)).toBe(false);
    });

    test('vrai pour un match sans résultat officiel', () => {
      expect(policy.isEditable('M2', official)).toBe(true);
    });

    test('vrai partout quand aucun officiel', () => {
      expect(policy.isEditable('M1', {})).toBe(true);
    });
  });

  describe('isLocked', () => {
    test('vrai pour un match ayant un résultat officiel', () => {
      expect(policy.isLocked('M1', official)).toBe(true);
    });

    test('faux pour un match sans résultat officiel', () => {
      expect(policy.isLocked('M2', official)).toBe(false);
    });
  });
});
