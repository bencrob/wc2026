import { describe, expect, it } from 'vitest';
import { ScoreMap } from '../models';
import { MatchAccessPolicy } from './match-access.policy';

const policy = new MatchAccessPolicy();

describe('MatchAccessPolicy', () => {
  const official: ScoreMap = { M1: { home: 2, away: 1 } };

  it('verrouille un match ayant un résultat officiel', () => {
    expect(policy.isEditable('M1', official)).toBe(false);
    expect(policy.isLocked('M1', official)).toBe(true);
  });

  it('laisse éditable un match sans résultat officiel', () => {
    expect(policy.isEditable('M2', official)).toBe(true);
    expect(policy.isLocked('M2', official)).toBe(false);
  });

  it('tout est éditable quand aucun officiel', () => {
    expect(policy.isEditable('M1', {})).toBe(true);
  });
});
