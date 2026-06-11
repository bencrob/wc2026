import { describe, expect, test } from 'vitest';
import { TeamNamePipe } from './team-name.pipe';

const pipe = new TeamNamePipe();

describe('TeamNamePipe', () => {
  describe('transform', () => {
    test('renvoie le nom de l’équipe pour un id connu', () => {
      expect(pipe.transform('A1')).toBeTruthy();
    });

    test('renvoie null pour un id absent', () => {
      expect(pipe.transform(null)).toBeNull();
      expect(pipe.transform(undefined)).toBeNull();
    });
  });
});
