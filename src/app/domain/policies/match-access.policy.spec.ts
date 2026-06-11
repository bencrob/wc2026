import { describe, expect, test } from 'vitest';
import { ScoreMap } from '../models';
import { MatchAccessPolicy } from './match-access.policy';

const policy = new MatchAccessPolicy();
const official: ScoreMap = { M1: { home: 2, away: 1 } };
const NOW = 1_000_000;
const NO_KICKOFF = undefined;

describe('MatchAccessPolicy', () => {
  describe('isEditable', () => {
    test('faux pour un match ayant un résultat officiel', () => {
      expect(policy.isEditable('M1', official, NO_KICKOFF, NOW)).toBe(false);
    });

    test('vrai pour un match sans officiel ni coup d’envoi passé', () => {
      expect(policy.isEditable('M2', official, NO_KICKOFF, NOW)).toBe(true);
    });

    test('faux dès que le coup d’envoi est atteint', () => {
      expect(policy.isEditable('M2', {}, NOW, NOW)).toBe(false);
      expect(policy.isEditable('M2', {}, NOW - 1, NOW)).toBe(false);
    });

    test('vrai tant que le coup d’envoi est dans le futur', () => {
      expect(policy.isEditable('M2', {}, NOW + 1, NOW)).toBe(true);
    });
  });

  describe('isLocked', () => {
    test('vrai pour un match officiel', () => {
      expect(policy.isLocked('M1', official, NO_KICKOFF, NOW)).toBe(true);
    });

    test('vrai pour un match dont le coup d’envoi est passé', () => {
      expect(policy.isLocked('M2', {}, NOW - 1, NOW)).toBe(true);
    });

    test('faux pour un match libre (ni officiel ni commencé)', () => {
      expect(policy.isLocked('M2', official, NOW + 1, NOW)).toBe(false);
    });
  });
});
